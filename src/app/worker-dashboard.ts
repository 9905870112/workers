import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth';
import { Router } from '@angular/router';
import { OrderService, Order } from './order.service';

@Component({
  selector: 'app-worker-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-4 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-bold text-xl">Worker Dashboard</h2>
          <p class="text-xs text-gray-500">Welcome, {{ auth.currentUser()?.name }}</p>
        </div>
        <button (click)="logout()" class="p-2 rounded-full hover:bg-gray-100">
          <mat-icon class="text-red-500">logout</mat-icon>
        </button>
      </div>

      <!-- Assigned Jobs -->
      <section class="space-y-4">
        <h3 class="font-bold text-lg">My Assigned Jobs</h3>
        
        <div class="space-y-4">
          @for (order of assignedOrders(); track order.id) {
            <div class="card space-y-4 border-l-4 border-l-primary">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-bold">{{ order.customer }}</h4>
                  <p class="text-xs text-gray-500">{{ order.service }} • {{ order.time }}</p>
                  <p class="text-[10px] text-gray-400 mt-1">{{ order.address }}</p>
                </div>
                <span class="badge bg-primary/10 text-primary-dark text-[10px]">Verified</span>
              </div>

              <!-- Order QR Code -->
              <div class="flex flex-col items-center gap-2 py-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div class="w-32 h-32 bg-white flex items-center justify-center border border-gray-100 rounded-lg overflow-hidden shadow-inner">
                   <img [src]="'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + order.id" 
                        alt="Order QR Code" 
                        class="w-full h-full object-contain p-2">
                </div>
                <p class="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Order ID: {{ order.id }}</p>
              </div>

              <button 
                (click)="markComplete(order.id)" 
                class="btn-primary w-full flex items-center justify-center gap-2"
              >
                <mat-icon>check_circle</mat-icon>
                Mark Task Complete
              </button>
            </div>
          } @empty {
            <div class="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-white rounded-3xl border border-dashed border-gray-200">
              <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                <mat-icon class="!text-3xl">assignment_late</mat-icon>
              </div>
              <div>
                <p class="font-bold text-gray-500">No Jobs Assigned</p>
                <p class="text-[10px] text-gray-400">Waiting for manager to assign tasks</p>
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkerDashboard implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  private orderService = inject(OrderService);

  assignedOrders = signal<Order[]>([]);

  ngOnInit() {
    if (this.auth.currentUser()?.role !== 'worker') {
      this.router.navigate(['/login'], { queryParams: { role: 'worker' } });
      return;
    }
    this.refreshOrders();
  }

  refreshOrders() {
    const all = this.orderService.getOrders()();
    // Show verified but not completed orders
    this.assignedOrders.set(all.filter(o => o.status === 'verified'));
  }

  markComplete(id: string) {
    this.orderService.completeOrder(id);
    this.refreshOrders();
    alert('Task completed successfully!');
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login'], { queryParams: { role: 'worker' } });
  }
}
