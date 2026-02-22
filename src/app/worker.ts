import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth';
import { Router } from '@angular/router';

interface Booking {
  id: string;
  customer: string;
  mobile: string;
  service: string;
  address: string;
  status: 'active' | 'completed' | 'cancelled';
  time: string;
}

@Component({
  selector: 'app-worker',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-4 space-y-6">
      <div class="flex items-center justify-between mb-2">
        <h2 class="font-bold text-xl">Worker Panel</h2>
        <div class="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Online
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4">
        <div class="card bg-primary/10 border-primary/20">
          <p class="text-[10px] text-gray-500 font-bold uppercase">Today's Earnings</p>
          <h4 class="text-xl font-bold text-secondary">₹1,240</h4>
        </div>
        <div class="card bg-secondary/5 border-secondary/10">
          <p class="text-[10px] text-gray-500 font-bold uppercase">Jobs Done</p>
          <h4 class="text-xl font-bold text-secondary">04</h4>
        </div>
      </div>

      <!-- Performance Stats -->
      <section class="card space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-sm">Weekly Performance</h3>
          <span class="text-[10px] text-gray-400 font-bold">LAST 7 DAYS</span>
        </div>
        
        <div class="flex items-end justify-between h-24 gap-2 pt-2">
          @for (day of ['M','T','W','T','F','S','S']; track $index) {
            <div class="flex-1 flex flex-col items-center gap-2">
              <div 
                class="w-full bg-primary/20 rounded-t-lg transition-all duration-500 hover:bg-primary"
                [style.height.%]="[40, 70, 50, 90, 60, 80, 30][$index]"
              ></div>
              <span class="text-[8px] font-bold text-gray-400">{{ day }}</span>
            </div>
          }
        </div>
      </section>

      <!-- Active Bookings -->
      <section class="space-y-4">
        <h3 class="font-bold text-lg">Active Bookings</h3>
        
        @if (bookings().length === 0) {
          <div class="flex flex-col items-center justify-center py-12 text-gray-400">
            <mat-icon class="!text-5xl mb-2">event_busy</mat-icon>
            <p class="text-sm">No active bookings right now</p>
          </div>
        } @else {
          <div class="space-y-4">
            @for (booking of bookings(); track booking.id) {
              <div class="card border-l-4 border-l-primary">
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <h4 class="font-bold text-sm">{{ booking.customer }}</h4>
                    <p class="text-xs text-gray-500">{{ booking.service }} Service</p>
                  </div>
                  <span class="text-[10px] font-bold text-gray-400">{{ booking.time }}</span>
                </div>
                
                <div class="flex items-center gap-2 text-xs text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg">
                  <mat-icon class="!text-sm">location_on</mat-icon>
                  <span class="truncate">{{ booking.address }}</span>
                </div>

                <div class="flex gap-2">
                  <button class="flex-1 bg-secondary text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                    <mat-icon class="!text-sm">directions</mat-icon>
                    Navigate
                  </button>
                  <button class="flex-1 bg-primary text-secondary py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                    <mat-icon class="!text-sm">check_circle</mat-icon>
                    Complete
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Worker implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);

  bookings = signal<Booking[]>([
    // ... same data ...
  ]);

  ngOnInit() {
    if (this.auth.currentUser()?.role !== 'worker' && this.auth.currentUser()?.role !== 'manager') {
      this.router.navigate(['/login'], { queryParams: { role: 'worker' } });
    }
  }
}
