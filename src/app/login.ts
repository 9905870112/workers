import { ChangeDetectionStrategy, Component, inject, signal, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService, UserRole } from './auth';

@Pipe({
  name: 'capitalize',
  standalone: true
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, CapitalizePipe],
  template: `
    <div class="p-4 space-y-6">
      <div class="flex items-center gap-3 mb-2">
        <button (click)="goBack()" class="p-2 rounded-full hover:bg-gray-100">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2 class="font-bold text-xl">{{ role() | capitalize }} Login</h2>
      </div>

      <div class="card space-y-6">
        @if (role() === 'customer') {
          <!-- Customer OTP Login -->
          @if (step() === 'phone') {
            <form [formGroup]="phoneForm" (ngSubmit)="sendOTP()" class="space-y-4">
              <div>
                <label for="phone" class="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                <input id="phone" type="tel" formControlName="phone" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" placeholder="Enter 10 digit number">
              </div>
              <button [disabled]="phoneForm.invalid" type="submit" class="btn-primary w-full">Send OTP</button>
            </form>
          } @else {
            <form [formGroup]="otpForm" (ngSubmit)="verifyOTP()" class="space-y-4">
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-2">OTP sent to {{ phoneForm.value.phone }}</p>
                <p class="text-xs font-bold text-primary-dark">Your AI Generated OTP: {{ generatedOTP() }}</p>
              </div>
              <div>
                <label for="otp" class="block text-xs font-bold text-gray-500 uppercase mb-1 text-center">Enter 4-Digit OTP</label>
                <input id="otp" type="text" formControlName="otp" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-center text-2xl tracking-[1rem]" maxlength="4">
              </div>
              <button [disabled]="otpForm.invalid" type="submit" class="btn-primary w-full">Verify & Login</button>
              <button (click)="step.set('phone')" type="button" class="w-full text-xs text-gray-400 font-bold">Change Number</button>
            </form>
          }
        } @else if (role() === 'manager' && step() === 'manager-init') {
          <form [formGroup]="managerRegForm" (ngSubmit)="sendOTP()" class="space-y-4">
            <h3 class="font-bold text-center text-sm">Manager Registration</h3>
            <div>
              <label for="reg-id" class="block text-xs font-bold text-gray-500 uppercase mb-1">Manager ID</label>
              <input id="reg-id" type="text" formControlName="id" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" placeholder="Enter ID">
            </div>
            <div>
              <label for="reg-phone" class="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
              <input id="reg-phone" type="tel" formControlName="phone" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" placeholder="Enter Phone">
            </div>
            <button [disabled]="managerRegForm.invalid" type="submit" class="btn-primary w-full">Verify with OTP</button>
            <button (click)="isRegisteringManager.set(false); step.set('id-pass')" type="button" class="w-full text-xs text-gray-400 font-bold">Back to Login</button>
          </form>
        } @else if (role() === 'manager' && step() === 'otp' && isRegisteringManager()) {
          <form [formGroup]="otpForm" (ngSubmit)="verifyOTP()" class="space-y-4">
            <div class="text-center">
              <p class="text-xs font-bold text-primary-dark">Manager Verification OTP: {{ generatedOTP() }}</p>
            </div>
            <div>
              <label for="otp-reg" class="block text-xs font-bold text-gray-500 uppercase mb-1 text-center">Enter OTP</label>
              <input id="otp-reg" type="text" formControlName="otp" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-center text-2xl tracking-[1rem]" maxlength="4">
            </div>
            <button [disabled]="otpForm.invalid" type="submit" class="btn-primary w-full">Verify OTP</button>
          </form>
        } @else if (role() === 'manager' && step() === 'set-password') {
          <form [formGroup]="setPasswordForm" (ngSubmit)="finishManagerReg()" class="space-y-4">
            <h3 class="font-bold text-center text-sm">Set Manager Credentials</h3>
            <div>
              <label for="reg-name" class="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
              <input id="reg-name" type="text" formControlName="name" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" placeholder="Enter Name">
            </div>
            <div>
              <label for="reg-pass" class="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
              <input id="reg-pass" type="password" formControlName="password" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" placeholder="Set Password">
            </div>
            <button [disabled]="setPasswordForm.invalid" type="submit" class="btn-primary w-full">Complete Registration</button>
          </form>
        } @else {
          <!-- Worker/Manager ID/Pass Login -->
          <form [formGroup]="idPassForm" (ngSubmit)="loginWithIdPass()" class="space-y-4">
            <div>
              <label for="id" class="block text-xs font-bold text-gray-500 uppercase mb-1">User ID</label>
              <input id="id" type="text" formControlName="id" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" placeholder="Enter ID">
            </div>
            <div>
              <label for="pass" class="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
              <input id="pass" type="password" formControlName="password" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" placeholder="Enter Password">
            </div>
            <button [disabled]="idPassForm.invalid" type="submit" class="btn-primary w-full">Login</button>
            
            @if (role() === 'manager') {
              <button (click)="startManagerReg()" type="button" class="w-full text-xs text-primary-dark font-bold mt-4">New Manager? Register Here</button>
            }
            
            <p class="text-[10px] text-gray-400 text-center">Use 'worker1' / 'pass123' for demo</p>
          </form>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  role = signal<UserRole>(null);
  step = signal<'phone' | 'otp' | 'id-pass' | 'set-password' | 'manager-init'>('phone');
  generatedOTP = signal<string>('');
  isRegisteringManager = signal<boolean>(false);

  phoneForm = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
  });

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^[0-9]{4}$/)]]
  });

  idPassForm = this.fb.group({
    id: ['', Validators.required],
    password: ['', Validators.required]
  });

  managerRegForm = this.fb.group({
    id: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
  });

  setPasswordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    name: ['', Validators.required]
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const r = params['role'] as UserRole || 'customer';
      this.role.set(r);
      if (r === 'customer') {
        this.step.set('phone');
      } else if (r === 'manager') {
        this.step.set('id-pass');
      } else {
        this.step.set('id-pass');
      }
    });
  }

  goBack() {
    this.router.navigate(['/profile']);
  }

  startManagerReg() {
    this.isRegisteringManager.set(true);
    this.step.set('manager-init');
  }

  sendOTP() {
    // Check if manager reg requirements are met
    if (this.isRegisteringManager()) {
      const { id, phone } = this.managerRegForm.value;
      if (id !== 'kitti99058' || phone !== '9905870112') {
        alert('Invalid Manager ID or Phone for registration!');
        return;
      }
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    this.generatedOTP.set(otp);
    this.step.set('otp');
  }

  verifyOTP() {
    if (this.otpForm.value.otp === this.generatedOTP()) {
      if (this.isRegisteringManager()) {
        this.step.set('set-password');
      } else {
        this.auth.login('customer', this.phoneForm.value.phone!, 'Customer User');
        this.router.navigate(['/']);
      }
    } else {
      alert('Invalid OTP! Try again.');
    }
  }

  finishManagerReg() {
    const { id, phone } = this.managerRegForm.value;
    const { password, name } = this.setPasswordForm.value;
    this.auth.registerManager(id!, phone!, password!, name!);
    alert('Manager Registered Successfully!');
    this.isRegisteringManager.set(false);
    this.step.set('id-pass');
  }

  loginWithIdPass() {
    const { id, password } = this.idPassForm.value;
    
    if (this.role() === 'manager') {
      const manager = this.auth.getManager(id!);
      if (manager && manager.pass === password) {
        this.auth.login('manager', id!, manager.name);
        this.router.navigate(['/']);
        return;
      }
    }

    // Default demo logic
    if (password === 'pass123') {
      const name = this.role() === 'manager' ? 'Admin Manager' : 'Field Worker';
      this.auth.login(this.role(), id!, name);
      this.router.navigate(['/']);
    } else {
      alert('Invalid Credentials!');
    }
  }
}
