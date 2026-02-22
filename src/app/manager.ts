import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth';
import { Router } from '@angular/router';

interface Worker {
  id: string;
  name: string;
  service: string;
  status: 'verified' | 'pending';
}

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-4 space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="font-bold text-xl">Manager Dashboard</h2>
        <mat-icon class="text-purple-600">admin_panel_settings</mat-icon>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-2">
        <div class="card p-2 text-center bg-blue-50">
          <p class="text-[8px] font-bold text-blue-600 uppercase">Total Workers</p>
          <p class="text-lg font-bold">12</p>
        </div>
        <div class="card p-2 text-center bg-green-50">
          <p class="text-[8px] font-bold text-green-600 uppercase">Active Jobs</p>
          <p class="text-lg font-bold">08</p>
        </div>
        <div class="card p-2 text-center bg-purple-50">
          <p class="text-[8px] font-bold text-purple-600 uppercase">Revenue</p>
          <p class="text-lg font-bold">₹45k</p>
        </div>
      </div>

      <!-- Worker Verification -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-lg">Worker Verification</h3>
          <button class="text-xs font-bold text-primary-dark">Add New</button>
        </div>

        <div class="space-y-3">
          @for (worker of workers(); track worker.id) {
            <div class="card flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <mat-icon class="text-gray-400">person</mat-icon>
                </div>
                <div>
                  <h4 class="font-bold text-sm">{{ worker.name }}</h4>
                  <p class="text-[10px] text-gray-500">{{ worker.service }}</p>
                </div>
              </div>
              
              @if (worker.status === 'pending') {
                <button (click)="verifyWorker(worker.id)" class="bg-primary text-secondary px-3 py-1 rounded-lg text-[10px] font-bold">
                  Verify ID
                </button>
              } @else {
                <div class="flex items-center gap-1 text-green-600">
                  <mat-icon class="!text-sm">verified</mat-icon>
                  <span class="text-[10px] font-bold">Verified</span>
                </div>
              }
            </div>
          }
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Manager implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);

  workers = signal<Worker[]>([
    { id: 'w1', name: 'Suresh Kumar', service: 'Electrician', status: 'verified' },
    { id: 'w2', name: 'Amit Singh', service: 'Plumber', status: 'pending' },
    { id: 'w3', name: 'Vikram Dev', service: 'AC Technician', status: 'pending' },
  ]);

  ngOnInit() {
    if (this.auth.currentUser()?.role !== 'manager') {
      this.router.navigate(['/login'], { queryParams: { role: 'manager' } });
    }
  }

  verifyWorker(id: string) {
    this.workers.update(list => list.map(w => w.id === id ? { ...w, status: 'verified' } : w));
  }
}
