import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="p-4 space-y-6">
      <div class="flex items-center gap-3 mb-2">
        <button (click)="goBack()" class="p-2 rounded-full hover:bg-gray-100">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2 class="font-bold text-xl">
          {{ step() === 'decoration-type' ? 'Select Occasion' : 'Book ' + serviceName() }}
        </h2>
      </div>

      @if (step() === 'decoration-type') {
        <div class="grid gap-4">
          @for (type of decorationTypes; track type.id) {
            <button (click)="selectDecoration(type.name)" class="card flex items-center justify-between hover:border-primary text-left">
              <div class="flex items-center gap-4">
                <div class="icon-box">
                  <mat-icon>{{ type.icon }}</mat-icon>
                </div>
                <div>
                  <h4 class="font-bold">{{ type.name }}</h4>
                  <p class="text-[10px] text-gray-500">{{ type.price }}</p>
                </div>
              </div>
              <mat-icon class="text-gray-300">chevron_right</mat-icon>
            </button>
          }
        </div>
      } @else if (step() === 'details') {
        <div class="card space-y-4">
          @if (selectedDecorationType()) {
            <div class="bg-primary/10 p-3 rounded-xl flex items-center gap-2 mb-2">
              <mat-icon class="text-primary-dark !text-sm">auto_awesome</mat-icon>
              <span class="text-xs font-bold">{{ selectedDecorationType() }}</span>
            </div>
          }
          <form [formGroup]="bookingForm" class="space-y-4">
            <div>
              <label for="mobile" class="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+91</span>
                <input 
                  id="mobile"
                  type="tel" 
                  formControlName="mobile"
                  class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="9876543210"
                >
              </div>
            </div>

            <div>
              <label for="address" class="block text-xs font-bold text-gray-500 uppercase mb-1">Service Address</label>
              <textarea 
                id="address"
                formControlName="address"
                rows="3"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
                placeholder="Enter your full address"
              ></textarea>
            </div>

            <button 
              (click)="useGPS()" 
              type="button"
              class="flex items-center gap-2 text-primary-dark text-sm font-bold"
            >
              <mat-icon class="!text-lg">my_location</mat-icon>
              Use Current Location
            </button>

            <button 
              [disabled]="bookingForm.invalid"
              (click)="reviewBooking()"
              class="btn-primary w-full mt-4 disabled:opacity-50 disabled:active:scale-100"
            >
              Review Booking
            </button>
          </form>
        </div>
      } @else if (step() === 'review') {
        <div class="space-y-6">
          <div class="card space-y-4">
            <h3 class="font-bold text-lg">Booking Summary</h3>
            
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Service</span>
                <span class="font-bold">{{ serviceName() }}</span>
              </div>
              @if (selectedDecorationType()) {
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Occasion</span>
                  <span class="font-bold">{{ selectedDecorationType() }}</span>
                </div>
              }
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Mobile</span>
                <span class="font-bold">+91 {{ bookingForm.value.mobile }}</span>
              </div>
              <div class="flex flex-col gap-1 text-sm">
                <span class="text-gray-500">Address</span>
                <span class="font-bold">{{ bookingForm.value.address }}</span>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 p-4 rounded-2xl flex gap-3">
            <mat-icon class="text-blue-500">info</mat-icon>
            <p class="text-[10px] text-blue-700 font-medium">
              By clicking confirm, you agree to our terms. An expert will be assigned within 5 minutes.
            </p>
          </div>

          <button (click)="confirmBooking()" class="btn-primary w-full">
            Confirm & Find Expert
          </button>
        </div>
      } @else if (step() === 'searching') {
        <div class="flex flex-col items-center justify-center py-12 space-y-8">
          <div class="relative w-48 h-48 flex items-center justify-center">
            <!-- Radar Animation -->
            <div class="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping"></div>
            <div class="absolute inset-4 border-4 border-primary/40 rounded-full animate-ping [animation-delay:0.5s]"></div>
            <div class="absolute inset-8 border-4 border-primary/60 rounded-full animate-ping [animation-delay:1s]"></div>
            
            <div class="bg-secondary p-8 rounded-full shadow-2xl z-10">
              <mat-icon class="!text-6xl text-primary animate-pulse">location_searching</mat-icon>
            </div>
          </div>

          <div class="text-center space-y-2">
            <h3 class="text-xl font-bold">Assigning Nearest Expert</h3>
            <p class="text-gray-500 text-sm">Checking availability in your area...</p>
            <p class="text-xs font-mono font-bold text-primary-dark">{{ countdown() }}s remaining</p>
          </div>

          <div class="w-full max-w-xs bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
            <div 
              class="bg-primary h-full transition-all duration-1000"
              [style.width.%]="(15 - countdown()) / 15 * 100"
            ></div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Booking implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  serviceId = signal<string>('');
  serviceName = signal<string>('');
  step = signal<'details' | 'searching' | 'decoration-type' | 'review'>('details');
  selectedDecorationType = signal<string | null>(null);
  countdown = signal<number>(15);

  decorationTypes = [
    { id: 'wedding', name: 'Wedding Decoration', icon: 'favorite', price: 'Starts ₹5000' },
    { id: 'anniversary', name: 'Anniversary Setup', icon: 'celebration', price: 'Starts ₹2000' },
    { id: 'birthday', name: 'Birthday Party', icon: 'cake', price: 'Starts ₹1500' },
  ];
  
  bookingForm = this.fb.group({
    mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    address: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.serviceId.set(params['id']);
      this.serviceName.set(this.capitalize(params['id']));
      if (params['id'] === 'decorator') {
        this.step.set('decoration-type');
      }
    });
  }

  selectDecoration(type: string) {
    this.selectedDecorationType.set(type);
    this.step.set('details');
  }

  capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  goBack() {
    if (this.step() === 'searching') {
      this.step.set('details');
    } else if (this.step() === 'details' && this.serviceId() === 'decorator') {
      this.step.set('decoration-type');
    } else {
      this.router.navigate(['/']);
    }
  }

  useGPS() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.bookingForm.patchValue({
          address: `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude} (Fetching address...)`
        });
      });
    }
  }

  findExpert() {
    this.step.set('searching');
    this.startCountdown();
  }

  reviewBooking() {
    if (this.bookingForm.valid) {
      this.step.set('review');
    }
  }

  confirmBooking() {
    this.step.set('searching');
    this.startCountdown();
  }

  startCountdown() {
    const interval = setInterval(() => {
      if (this.countdown() > 0) {
        this.countdown.update(v => v - 1);
      } else {
        clearInterval(interval);
        this.router.navigate(['/payment', this.serviceId()], {
          queryParams: { 
            mobile: this.bookingForm.value.mobile,
            address: this.bookingForm.value.address
          }
        });
      }
    }, 1000);
  }
}
