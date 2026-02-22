import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth';
import { Router } from '@angular/router';
import { GeminiService } from './gemini';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { OrderService, Order } from './order.service';
import { computed } from '@angular/core';

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
          <p class="text-lg font-bold">{{ activeOrdersCount() }}</p>
        </div>
        <div class="card p-2 text-center bg-purple-50">
          <p class="text-[8px] font-bold text-purple-600 uppercase">Revenue</p>
          <p class="text-lg font-bold">₹{{ totalRevenue() }}</p>
        </div>
      </div>

      <!-- Order History Table (Excel Style) -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-lg">Order History</h3>
          <button (click)="exportToExcel()" class="text-[10px] font-bold text-primary-dark flex items-center gap-1">
            <mat-icon class="!text-xs">download</mat-icon>
            Export
          </button>
        </div>

        <div class="overflow-x-auto -mx-4 px-4">
          <table class="w-full text-left border-collapse bg-white rounded-xl shadow-sm overflow-hidden min-w-[600px]">
            <thead class="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold">
              <tr>
                <th class="p-3 border-b">Order ID</th>
                <th class="p-3 border-b">Customer</th>
                <th class="p-3 border-b">Service</th>
                <th class="p-3 border-b">Payment</th>
                <th class="p-3 border-b">Amount</th>
                <th class="p-3 border-b">Status</th>
                <th class="p-3 border-b">Action</th>
              </tr>
            </thead>
            <tbody class="text-xs">
              @for (order of activeOrders(); track order.id) {
                <tr class="hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <td class="p-3 font-mono font-bold text-primary-dark cursor-pointer" (click)="viewOrderQR(order)" tabindex="0" role="button" (keydown.enter)="viewOrderQR(order)">{{ order.id }}</td>
                  <td class="p-3">
                    <div class="font-bold">{{ order.customer }}</div>
                    <div class="text-[10px] text-gray-400">{{ order.mobile }}</div>
                  </td>
                  <td class="p-3">{{ order.service }}</td>
                  <td class="p-3">
                    <span class="badge" [class.bg-blue-100]="order.paymentType === 'online'" [class.text-blue-700]="order.paymentType === 'online'" [class.bg-orange-100]="order.paymentType === 'cash'" [class.text-orange-700]="order.paymentType === 'cash'">
                      {{ order.paymentType | uppercase }}
                    </span>
                  </td>
                  <td class="p-3 font-bold">₹{{ order.price }}</td>
                  <td class="p-3">
                    @if (order.status === 'pending') {
                      <span class="text-red-500 font-bold">Not Verified</span>
                    } @else if (order.status === 'verified') {
                      <div class="flex items-center gap-1 text-yellow-500 font-bold">
                        <mat-icon class="!text-sm">check_circle</mat-icon>
                        <span>Verified</span>
                      </div>
                    } @else if (order.status === 'completed') {
                      <div class="flex items-center gap-1 text-green-500 font-bold">
                        <mat-icon class="!text-sm">check_circle</mat-icon>
                        <span>Completed</span>
                      </div>
                    }
                  </td>
                  <td class="p-3">
                    @if (order.status === 'pending') {
                      <button (click)="verifyBooking(order.id)" class="bg-primary text-secondary px-2 py-1 rounded text-[10px] font-bold">Verify</button>
                    } @else {
                      <mat-icon class="text-gray-300">done_all</mat-icon>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="p-8 text-center text-gray-400 italic">No bookings found</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- QR Code Modal (Simple Overlay) -->
      @if (selectedOrderForQR()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="selectedOrderForQR.set(null)" (keydown)="onModalKeydown($event)" tabindex="0" role="button">
          <div class="bg-white rounded-3xl p-6 w-full max-w-xs space-y-6 animate-in zoom-in-95" (click)="$event.stopPropagation()" role="dialog">
            <div class="flex justify-between items-center">
              <h4 class="font-bold">Order Verification</h4>
              <button (click)="selectedOrderForQR.set(null)"><mat-icon>close</mat-icon></button>
            </div>
            <div class="flex flex-col items-center gap-4">
              <div class="w-48 h-48 bg-white flex items-center justify-center border-2 border-primary rounded-2xl p-2">
                <img [src]="'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + selectedOrderForQR()?.id" alt="Order QR">
              </div>
              <div class="text-center">
                <p class="font-bold text-primary-dark">{{ selectedOrderForQR()?.id }}</p>
                <p class="text-xs text-gray-500">{{ selectedOrderForQR()?.customer }}</p>
              </div>
            </div>
            @if (selectedOrderForQR()?.status === 'pending') {
              <button (click)="verifyBooking(selectedOrderForQR()!.id); selectedOrderForQR.set(null)" class="btn-primary w-full">Verify Now</button>
            }
          </div>
        </div>
      }

      <!-- Active Orders Cards (Original View) -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-lg">Customer Bookings</h3>
          <span class="badge bg-green-100 text-green-700">{{ activeOrders().length }} Live</span>
        </div>

        <div class="space-y-4">
          @for (order of activeOrders(); track order.id) {
            <div class="card space-y-4 border-l-4" [class.border-l-purple-500]="!order.verified" [class.border-l-green-500]="order.verified">
              <div class="flex justify-between items-start">
                <div class="flex gap-3">
                  <div class="relative">
                    <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <mat-icon class="text-gray-400">person</mat-icon>
                    </div>
                    @if (order.verified) {
                      <div class="absolute -right-1 -bottom-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white">
                        <mat-icon class="!text-[10px] !w-auto !h-auto">check</mat-icon>
                      </div>
                    }
                  </div>
                  <div>
                    <h4 class="font-bold text-base flex items-center gap-2">
                      {{ order.customer }}
                      @if (order.verified) {
                        <mat-icon class="text-green-500 !text-sm">verified</mat-icon>
                      }
                    </h4>
                    <p class="text-xs text-gray-500 flex items-center gap-1">
                      <mat-icon class="!text-xs">phone</mat-icon>
                      {{ order.mobile }}
                    </p>
                    <p class="text-[10px] text-gray-400 mt-1">{{ order.service }} • {{ order.time }}</p>
                    @if (order.floor || order.roomNo) {
                      <div class="flex gap-2 mt-1">
                        @if (order.floor) {
                          <span class="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[8px] font-bold">FL: {{ order.floor }}</span>
                        }
                        @if (order.roomNo) {
                          <span class="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[8px] font-bold">RM: {{ order.roomNo }}</span>
                        }
                      </div>
                    }
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-sm font-bold text-primary-dark">₹{{ order.price }}</span>
                  <p class="text-[8px] text-gray-400 uppercase font-bold">Amount</p>
                </div>
              </div>
              
              <div class="flex flex-col gap-3 p-3 bg-gray-50 rounded-2xl">
                <div class="flex items-center gap-2 text-[10px] text-gray-600 cursor-pointer hover:text-primary" (click)="openMap(order.address)" tabindex="0" role="button" (keydown.enter)="openMap(order.address)">
                  <mat-icon class="!text-xs">location_on</mat-icon>
                  <span class="truncate font-medium">{{ order.address }}</span>
                  <mat-icon class="!text-xs ml-auto">open_in_new</mat-icon>
                </div>

                <!-- Real Location Preview (Map) -->
                <div class="w-full h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-200 relative">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameborder="0" 
                    style="border:0"
                    [src]="getMapUrl(order.address)" 
                    allowfullscreen
                    referrerpolicy="no-referrer-when-downgrade">
                  </iframe>
                  <div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[8px] font-bold shadow-sm">
                    REAL LOCATION
                  </div>
                </div>

                <!-- Location QR Code -->
                <div class="flex flex-col items-center gap-2 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div class="w-32 h-32 bg-white flex items-center justify-center overflow-hidden">
                    <img [src]="'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(order.address)" 
                         alt="Location QR" 
                         class="w-full h-full object-contain p-1">
                  </div>
                  <p class="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Scan for Location</p>
                </div>
              </div>

              <div class="flex gap-2">
                <button 
                  (click)="verifyBooking(order.id)" 
                  class="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  [class]="order.verified ? 'bg-green-100 text-green-700' : 'bg-primary text-secondary'"
                >
                  <mat-icon class="!text-sm">{{ order.verified ? 'check_circle' : 'verified' }}</mat-icon>
                  {{ order.verified ? 'Verified' : 'Verify Booking' }}
                </button>
                <button (click)="analyzeLocation(order)" class="flex-1 bg-purple-100 text-purple-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                  <mat-icon class="!text-sm">auto_awesome</mat-icon>
                  {{ loadingAnalysis()[order.id] ? '...' : 'Analyze' }}
                </button>
              </div>

              @if (locationAnalysis()[order.id]) {
                <div class="bg-purple-50 p-3 rounded-xl text-[10px] text-purple-800 leading-relaxed border border-purple-100 animate-in fade-in slide-in-from-top-2">
                  <div class="flex items-center gap-1 mb-1 font-bold">
                    <mat-icon class="!text-xs">analytics</mat-icon>
                    AI INSIGHTS
                  </div>
                  {{ locationAnalysis()[order.id] }}
                </div>
              }
            </div>
          } @empty {
            <div class="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-white rounded-3xl border border-dashed border-gray-200">
              <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                <mat-icon class="!text-3xl">history</mat-icon>
              </div>
              <div>
                <p class="font-bold text-gray-500">No Bookings Yet</p>
                <p class="text-[10px] text-gray-400">New customer bookings will appear here</p>
              </div>
            </div>
          }
        </div>
      </section>

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
  private gemini = inject(GeminiService);
  private sanitizer = inject(DomSanitizer);
  private orderService = inject(OrderService);

  workers = signal<Worker[]>([
    { id: 'w1', name: 'Suresh Kumar', service: 'Electrician', status: 'verified' },
    { id: 'w2', name: 'Amit Singh', service: 'Plumber', status: 'pending' },
    { id: 'w3', name: 'Vikram Dev', service: 'AC Technician', status: 'pending' },
  ]);

  activeOrders = this.orderService.getOrders();
  selectedOrderForQR = signal<Order | null>(null);

  activeOrdersCount = computed(() => this.activeOrders().filter(o => o.status !== 'completed').length);
  totalRevenue = computed(() => this.activeOrders().reduce((acc, o) => acc + o.price, 0));

  locationAnalysis = signal<Record<string, string>>({});
  loadingAnalysis = signal<Record<string, boolean>>({});

  ngOnInit() {
    if (this.auth.currentUser()?.role !== 'manager') {
      this.router.navigate(['/login'], { queryParams: { role: 'manager' } });
    }
  }

  verifyWorker(id: string) {
    this.workers.update(list => list.map(w => w.id === id ? { ...w, status: 'verified' } : w));
  }

  verifyBooking(id: string) {
    this.orderService.verifyOrder(id);
    alert('Message Sent: Your booking confirmed!');
  }

  viewOrderQR(order: Order) {
    this.selectedOrderForQR.set(order);
  }

  exportToExcel() {
    alert('Exporting order history to Excel...');
    // In a real app, use a library like xlsx
  }

  onModalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Enter') {
      this.selectedOrderForQR.set(null);
    }
  }

  getMapUrl(address: string): SafeResourceUrl {
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  encodeURIComponent(s: string) {
    return encodeURIComponent(s);
  }

  async analyzeLocation(order: Order) {
    if (this.loadingAnalysis()[order.id]) return;
    
    this.loadingAnalysis.update(v => ({ ...v, [order.id]: true } as Record<string, boolean>));
    try {
      const analysis = await this.gemini.getLocationInfo(order.address);
      this.locationAnalysis.update(v => ({ ...v, [order.id]: analysis } as Record<string, string>));
    } catch (e) {
      console.error(e);
      alert('Could not analyze location');
    } finally {
      this.loadingAnalysis.update(v => ({ ...v, [order.id]: false } as Record<string, boolean>));
    }
  }

  openMap(address: string) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  }
}
