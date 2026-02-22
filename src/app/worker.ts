import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth';
import { Router } from '@angular/router';
import { GeminiService } from './gemini';

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
                
                <div class="flex flex-col gap-2 mb-4">
                  <div class="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <mat-icon class="!text-sm">location_on</mat-icon>
                    <span class="truncate">{{ booking.address }}</span>
                  </div>
                  
                  @if (locationTips()[booking.id]) {
                    <div class="bg-blue-50 p-3 rounded-xl text-[10px] text-blue-800 leading-relaxed border border-blue-100">
                      <div class="flex items-center gap-1 mb-1 font-bold">
                        <mat-icon class="!text-xs">auto_awesome</mat-icon>
                        AI LOCATION TIPS
                      </div>
                      {{ locationTips()[booking.id] }}
                    </div>
                  }
                </div>

                <div class="flex flex-wrap gap-2">
                  <button (click)="getTips(booking)" class="flex-1 min-w-[120px] bg-blue-600 text-white py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1">
                    <mat-icon class="!text-sm">map</mat-icon>
                    {{ loadingTips()[booking.id] ? 'Loading...' : 'Location Tips' }}
                  </button>
                  <button (click)="openMap(booking.address)" class="flex-1 min-w-[120px] bg-secondary text-white py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1">
                    <mat-icon class="!text-sm">directions</mat-icon>
                    Navigate
                  </button>
                  <button class="w-full bg-primary text-secondary py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 mt-1">
                    <mat-icon class="!text-sm">check_circle</mat-icon>
                    Complete Job
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
  private gemini = inject(GeminiService);

  bookings = signal<Booking[]>([
    { id: 'b1', customer: 'Rahul Sharma', mobile: '9876543210', service: 'Electrician', address: 'Flat 402, Sunshine Apartments, Sector 62, Noida', status: 'active', time: '10:30 AM' },
    { id: 'b2', customer: 'Priya Verma', mobile: '9988776655', service: 'Plumber', address: 'House No. 12, Gali 4, Laxmi Nagar, Delhi', status: 'active', time: '12:15 PM' },
  ]);

  locationTips = signal<Record<string, string>>({});
  loadingTips = signal<Record<string, boolean>>({});

  ngOnInit() {
    if (this.auth.currentUser()?.role !== 'worker' && this.auth.currentUser()?.role !== 'manager') {
      this.router.navigate(['/login'], { queryParams: { role: 'worker' } });
    }
  }

  async getTips(booking: Booking) {
    if (this.loadingTips()[booking.id]) return;
    
    this.loadingTips.update(v => ({ ...v, [booking.id]: true } as Record<string, boolean>));
    try {
      const tips = await this.gemini.getLocationInfo(booking.address);
      this.locationTips.update(v => ({ ...v, [booking.id]: tips } as Record<string, string>));
    } catch (e) {
      console.error(e);
      alert('Could not get location tips');
    } finally {
      this.loadingTips.update(v => ({ ...v, [booking.id]: false } as Record<string, boolean>));
    }
  }

  openMap(address: string) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  }
}
