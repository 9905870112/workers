import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="space-y-6 pb-20">
      <!-- Search Bar -->
      <div class="px-4 pt-4">
        <div class="relative">
          <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</mat-icon>
          <input 
            type="text" 
            placeholder="Search for 'AC repair' or 'Electrician'..." 
            class="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:border-primary"
          >
        </div>
      </div>

      <!-- Hero Banner -->
      <section class="px-4">
        <div class="bg-secondary text-white rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div class="relative z-10 space-y-2">
            <span class="badge bg-primary text-secondary">New User Offer</span>
            <h2 class="text-2xl font-bold leading-tight">Flat ₹100 OFF<br>on first service</h2>
            <button class="bg-white text-secondary px-4 py-2 rounded-lg text-xs font-bold mt-2">Book Now</button>
          </div>
          <mat-icon class="absolute -right-4 -bottom-4 !text-9xl opacity-10 rotate-12">bolt</mat-icon>
        </div>
      </section>

      <!-- Categories Grid -->
      <section class="px-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-lg">Services for You</h2>
          <span class="text-primary-dark text-sm font-bold">View All</span>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          @for (service of services(); track service.id) {
            <div [routerLink]="['/booking', service.id]" class="card hover:border-primary transition-all cursor-pointer group flex flex-col justify-between active:scale-95">
              <div>
                <div class="icon-box mb-3 group-hover:bg-primary/20 transition-colors">
                  <mat-icon>{{ service.icon }}</mat-icon>
                </div>
                <h3 class="font-bold text-sm mb-1">{{ service.name }}</h3>
                <p class="text-[10px] text-gray-500 mb-2">{{ service.description }}</p>
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs font-bold text-primary-dark">{{ service.price }}</span>
                <div class="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary transition-colors">
                  <mat-icon class="text-gray-300 group-hover:text-secondary !text-sm">arrow_forward</mat-icon>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Trust Badges -->
      <div class="px-4 grid grid-cols-3 gap-2">
        <div class="flex flex-col items-center text-center gap-1">
          <div class="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
            <mat-icon class="!text-lg">verified_user</mat-icon>
          </div>
          <span class="text-[8px] font-bold text-gray-500 uppercase">Verified Experts</span>
        </div>
        <div class="flex flex-col items-center text-center gap-1">
          <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <mat-icon class="!text-lg">security</mat-icon>
          </div>
          <span class="text-[8px] font-bold text-gray-500 uppercase">Insured Service</span>
        </div>
        <div class="flex flex-col items-center text-center gap-1">
          <div class="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <mat-icon class="!text-lg">timer</mat-icon>
          </div>
          <span class="text-[8px] font-bold text-gray-500 uppercase">45 Min Arrival</span>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  services = signal<ServiceCategory[]>([
    { id: 'electrician', name: 'Electrician', icon: 'bolt', description: 'Expert 15 Min Fix', price: 'Starts ₹500' },
    { id: 'plumber', name: 'Plumber', icon: 'water_drop', description: 'Tap & Leakage Expert', price: 'Starts ₹599' },
    { id: 'ac', name: 'AC Technician', icon: 'ac_unit', description: 'Service & Repair', price: 'Starts ₹599' },
    { id: 'decorator', name: 'Home Decoration', icon: 'auto_awesome', description: 'Wedding, Birthday, Anniversary', price: 'Get Quote' },
    { id: 'carpenter', name: 'Carpenter', icon: 'handyman', description: 'Door, Lock & Furniture', price: 'Starts ₹600' },
  ]);
}
