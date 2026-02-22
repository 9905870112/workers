import { ChangeDetectionStrategy, Component, inject, signal, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService, UserRole } from './auth';
import { Auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '@angular/fire/auth';

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
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+91</span>
                  <input id="phone" type="tel" formControlName="phone" class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" placeholder="Enter 10 digit number">
                </div>
              </div>
              <div id="recaptcha-container"></div>
              <button [disabled]="phoneForm.invalid || loading()" type="submit" class="btn-primary w-full">
                {{ loading() ? 'Sending...' : 'Send OTP' }}
              </button>
            </form>
          } @else {
            <form [formGroup]="otpForm" (ngSubmit)="verifyOTP()" class="space-y-4">
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-2">OTP sent to +91 {{ phoneForm.value.phone }}</p>
              </div>
              <div>
                <label for="otp" class="block text-xs font-bold text-gray-500 uppercase mb-1 text-center">Enter 6-Digit OTP</label>
                <input id="otp" type="text" formControlName="otp" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-center text-2xl tracking-[0.5rem]" maxlength="6">
              </div>
              <button [disabled]="otpForm.invalid || loading()" type="submit" class="btn-primary w-full">
                {{ loading() ? 'Verifying...' : 'Verify & Login' }}
              </button>
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
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+91</span>
                <input id="reg-phone" type="tel" formControlName="phone" class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" placeholder="Enter Phone">
              </div>
            </div>
            <div id="recaptcha-container"></div>
            <button [disabled]="managerRegForm.invalid || loading()" type="submit" class="btn-primary w-full">
              {{ loading() ? 'Sending...' : 'Verify with OTP' }}
            </button>
            <button (click)="isRegisteringManager.set(false); step.set('id-pass')" type="button" class="w-full text-xs text-gray-400 font-bold">Back to Login</button>
          </form>
        } @else if (role() === 'manager' && step() === 'otp' && isRegisteringManager()) {
          <form [formGroup]="otpForm" (ngSubmit)="verifyOTP()" class="space-y-4">
            <div class="text-center">
              <p class="text-xs font-bold text-primary-dark">Enter OTP sent to your phone</p>
            </div>
            <div>
              <label for="otp-reg" class="block text-xs font-bold text-gray-500 uppercase mb-1 text-center">Enter OTP</label>
              <input id="otp-reg" type="text" formControlName="otp" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-center text-2xl tracking-[0.5rem]" maxlength="6">
            </div>
            <button [disabled]="otpForm.invalid || loading()" type="submit" class="btn-primary w-full">
              {{ loading() ? 'Verifying...' : 'Verify OTP' }}
            </button>
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
            <button [disabled]="setPasswordForm.invalid || loading()" type="submit" class="btn-primary w-full">Complete Registration</button>
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
            <button [disabled]="idPassForm.invalid || loading()" type="submit" class="btn-primary w-full">Login</button>
            
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
  private authService = inject(AuthService);
  private firebaseAuth = inject(Auth);

  role = signal<UserRole>(null);
  step = signal<'phone' | 'otp' | 'id-pass' | 'set-password' | 'manager-init'>('phone');
  loading = signal<boolean>(false);
  isRegisteringManager = signal<boolean>(false);
  
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  phoneForm = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
  });

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
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

  async sendOTP() {
    if (this.loading()) return;

    const phone = this.isRegisteringManager() 
      ? this.managerRegForm.value.phone 
      : this.phoneForm.value.phone;

    if (this.isRegisteringManager()) {
      const id = this.managerRegForm.value.id;
      if (id !== 'kitti99058' || phone !== '9905870112') {
        alert('Invalid Manager ID or Phone for registration!');
        return;
      }
    }

    try {
      this.loading.set(true);
      
      if (!this.recaptchaVerifier) {
        this.recaptchaVerifier = new RecaptchaVerifier(this.firebaseAuth, 'recaptcha-container', {
          size: 'invisible'
        });
      }

      const phoneNumber = `+91${phone}`;
      this.confirmationResult = await signInWithPhoneNumber(this.firebaseAuth, phoneNumber, this.recaptchaVerifier);
      
      this.step.set('otp');
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Firebase Auth Error:', err);
      alert('Error sending OTP: ' + err.message);
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }
    } finally {
      this.loading.set(false);
    }
  }

  async verifyOTP() {
    if (this.loading() || !this.confirmationResult) return;

    try {
      this.loading.set(true);
      const otp = this.otpForm.value.otp!;
      await this.confirmationResult.confirm(otp);

      if (this.isRegisteringManager()) {
        this.step.set('set-password');
      } else {
        this.authService.login('customer', this.phoneForm.value.phone!, 'Customer User');
        this.router.navigate(['/']);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('OTP Verification Error:', err);
      alert('Invalid OTP: ' + err.message);
    } finally {
      this.loading.set(false);
    }
  }

  finishManagerReg() {
    const { id, phone } = this.managerRegForm.value;
    const { password, name } = this.setPasswordForm.value;
    this.authService.registerManager(id!, phone!, password!, name!);
    alert('Manager Registered Successfully!');
    this.isRegisteringManager.set(false);
    this.step.set('id-pass');
  }

  loginWithIdPass() {
    const { id, password } = this.idPassForm.value;
    
    if (this.role() === 'manager') {
      if (id === 'chandani99058' && password === 'kitti#') {
        this.authService.login('manager', id, 'Chandani Manager');
        this.router.navigate(['/']);
        return;
      } else {
        alert('Invalid Manager Credentials! Access Denied.');
        return;
      }
    }

    if (this.role() === 'worker') {
      if (this.authService.loginWorker(id!, password!)) {
        this.router.navigate(['/worker-dashboard']);
        return;
      } else {
        alert('Invalid Worker Credentials!');
        return;
      }
    }

    alert('Login not supported for this role.');
  }
}
