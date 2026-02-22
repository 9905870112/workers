import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="p-4 flex flex-col items-center justify-center min-h-[80vh] space-y-8 text-center">
      <div class="relative">
        <div class="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
        <div class="bg-green-500 text-white p-6 rounded-full shadow-xl relative z-10">
          <mat-icon class="!text-6xl">check_circle</mat-icon>
        </div>
      </div>

      <div class="space-y-2">
        <h2 class="text-2xl font-bold">Booking Confirmed!</h2>
        <p class="text-gray-500 text-sm">Thank you, <span class="text-primary-dark font-bold">{{ name() }}</span>. Your expert is on the way.</p>
      </div>

      <div class="card w-full space-y-4 text-left">
        <div class="flex justify-between items-center pb-3 border-b border-gray-100">
          <span class="text-xs text-gray-400 font-bold uppercase">Booking ID</span>
          <span class="text-sm font-mono font-bold">#GFX{{ bookingId() }}</span>
        </div>
        
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="icon-box !w-8 !h-8">
              <mat-icon class="!text-sm">schedule</mat-icon>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-bold">ESTIMATED ARRIVAL</p>
              <p class="text-sm font-bold">15 - 20 Minutes</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="icon-box !w-8 !h-8">
              <mat-icon class="!text-sm">person</mat-icon>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-bold">ASSIGNED EXPERT</p>
              <p class="text-sm font-bold">Suresh Kumar (Verified)</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="icon-box !w-8 !h-8">
              <mat-icon class="!text-sm">location_on</mat-icon>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-bold">SERVICE LOCATION</p>
              <p class="text-sm font-bold truncate max-w-[200px]">{{ address() }}</p>
              @if (floor() || roomNo()) {
                <p class="text-[10px] text-gray-400">Floor: {{ floor() }}, Room: {{ roomNo() }}</p>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 text-left w-full">
        <mat-icon class="text-blue-500 !text-xl">sms</mat-icon>
        <div>
          <h4 class="text-xs font-bold text-blue-700">SMS Sent!</h4>
          <p class="text-[10px] text-blue-600">A confirmation SMS has been sent to your registered mobile number.</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 w-full">
        <div class="card p-3 flex flex-col items-center text-center gap-2 bg-green-50/50">
          <mat-icon class="text-green-600">security</mat-icon>
          <span class="text-[8px] font-bold">₹10k INSURANCE COVERED</span>
        </div>
        <div class="card p-3 flex flex-col items-center text-center gap-2 bg-orange-50/50">
          <mat-icon class="text-orange-600">verified</mat-icon>
          <span class="text-[8px] font-bold">BACKGROUND CHECKED</span>
        </div>
      </div>

      <button routerLink="/" class="btn-primary w-full">Back to Home</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Success implements OnInit {
  private route = inject(ActivatedRoute);
  bookingId = signal<string>('');
  address = signal<string>('N/A');
  name = signal<string>('Customer');
  floor = signal<string>('');
  roomNo = signal<string>('');

  ngOnInit() {
    this.bookingId.set(Math.random().toString(36).substring(2, 8).toUpperCase());
    this.route.queryParams.subscribe(params => {
      if (params['address']) this.address.set(params['address']);
      if (params['name']) this.name.set(params['name']);
      if (params['floor']) this.floor.set(params['floor']);
      if (params['roomNo']) this.roomNo.set(params['roomNo']);
    });
  }
}
