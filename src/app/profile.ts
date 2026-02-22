import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from './auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-4 space-y-6">
      <h2 class="font-bold text-2xl">Profile</h2>

      @if (!auth.currentUser()) {
        <div class="space-y-4">
          <p class="text-gray-500 text-sm">Portal Access</p>
          
          <div class="grid gap-4">
            <button (click)="goToLogin('manager')" class="card flex items-center gap-4 hover:border-primary text-left bg-purple-50/50 border-purple-100">
              <div class="icon-box bg-purple-100 text-purple-600">
                <mat-icon>admin_panel_settings</mat-icon>
              </div>
              <div>
                <h4 class="font-bold">Manager Login</h4>
                <p class="text-[10px] text-gray-500">Access bookings & customer location data</p>
              </div>
            </button>

            <button (click)="goToLogin('worker')" class="card flex items-center gap-4 hover:border-primary text-left bg-blue-50/50 border-blue-100">
              <div class="icon-box bg-blue-100 text-blue-600">
                <mat-icon>engineering</mat-icon>
              </div>
              <div>
                <h4 class="font-bold">Worker Login</h4>
                <p class="text-[10px] text-gray-500">View assigned tasks & mark completion</p>
              </div>
            </button>
          </div>
        </div>
      } @else {
        <div class="card space-y-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-secondary">
              <mat-icon class="!text-3xl">account_circle</mat-icon>
            </div>
            <div>
              <h3 class="font-bold text-lg">{{ auth.currentUser()?.name }}</h3>
              <p class="text-xs text-gray-500 capitalize">{{ auth.currentUser()?.role }} Account</p>
            </div>
          </div>

          <div class="space-y-2">
            <button class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <mat-icon class="text-gray-400">home</mat-icon>
                <div class="text-left">
                  <p class="text-sm">Saved Addresses</p>
                  <p class="text-[10px] text-gray-400">Home, Office</p>
                </div>
              </div>
              <mat-icon class="text-gray-300">chevron_right</mat-icon>
            </button>
            <button class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <mat-icon class="text-gray-400">payments</mat-icon>
                <div class="text-left">
                  <p class="text-sm">Payment Methods</p>
                  <p class="text-[10px] text-gray-400">UPI, Saved Cards</p>
                </div>
              </div>
              <mat-icon class="text-gray-300">chevron_right</mat-icon>
            </button>
            <button class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <mat-icon class="text-gray-400">settings</mat-icon>
                <span class="text-sm">Account Settings</span>
              </div>
              <mat-icon class="text-gray-300">chevron_right</mat-icon>
            </button>
            <button (click)="logout()" class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 text-red-600">
              <div class="flex items-center gap-3">
                <mat-icon>logout</mat-icon>
                <span class="text-sm font-bold">Logout</span>
              </div>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  auth = inject(AuthService);
  private router = inject(Router);

  goToLogin(role: string) {
    this.router.navigate(['/login'], { queryParams: { role } });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
