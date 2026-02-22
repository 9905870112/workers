import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from './order.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-4 space-y-6">
      <div class="flex items-center gap-3 mb-2">
        <button (click)="goBack()" class="p-2 rounded-full hover:bg-gray-100">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2 class="font-bold text-xl">Payment Checkout</h2>
      </div>

      <!-- Service Summary -->
      <div class="card bg-secondary text-white border-none">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-gray-400 text-xs uppercase font-bold tracking-wider">Service Booked</p>
            <h3 class="text-lg font-bold">{{ serviceName() }} Service</h3>
          </div>
          <div class="bg-primary text-secondary p-2 rounded-xl">
            <mat-icon>{{ serviceIcon() }}</mat-icon>
          </div>
        </div>
        <div class="flex justify-between items-center pt-4 border-t border-white/10">
          <span class="text-gray-400 text-sm">Total Amount</span>
          <span class="text-2xl font-bold text-primary">₹{{ amount() }}</span>
        </div>
      </div>

      <!-- Payment Options -->
      <div class="space-y-4">
        <h3 class="font-bold text-gray-500 text-xs uppercase tracking-widest">Payment Methods</h3>
        
        <!-- UPI Option -->
        <div class="card border-primary bg-primary/5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="bg-primary p-2 rounded-lg">
                <mat-icon class="text-secondary">qr_code_2</mat-icon>
              </div>
              <div>
                <h4 class="font-bold text-sm">UPI Payment</h4>
                <p class="text-[10px] text-gray-500">GPay, PhonePe, Paytm</p>
              </div>
            </div>
            <span class="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">FASTEST</span>
          </div>
          
          <div class="flex flex-col items-center gap-4 py-4 bg-white rounded-xl border border-gray-100">
            <!-- Actual QR Code Image -->
            <div class="w-48 h-48 bg-white flex items-center justify-center border border-gray-100 rounded-lg overflow-hidden shadow-inner">
               <img [src]="'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=9905870112@ibl%26pn=Krishna%20GharFix%26am=' + amount() + '%26cu=INR'" 
                    alt="Payment QR Code" 
                    class="w-full h-full object-contain p-2">
            </div>
            <p class="text-[10px] text-gray-400">Scan to pay ₹{{ amount() }} to Krishna (9905870112@ibl)</p>
          </div>

          <button (click)="payViaUPI()" class="btn-primary w-full mt-4">
            Pay via UPI Intent
          </button>
        </div>

        <!-- Card Option -->
        <div class="card hover:border-gray-300 transition-colors cursor-pointer">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="bg-gray-100 p-2 rounded-lg">
                <mat-icon class="text-gray-600">credit_card</mat-icon>
              </div>
              <div>
                <h4 class="font-bold text-sm">Credit / Debit Card</h4>
                <p class="text-[10px] text-gray-500">Visa, Mastercard, RuPay</p>
              </div>
            </div>
            <mat-icon class="text-gray-300">chevron_right</mat-icon>
          </div>
        </div>

        <!-- Cash Option -->
        <div (click)="payViaCash()" tabindex="0" role="button" (keydown.enter)="payViaCash()" class="card hover:border-primary transition-colors cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="bg-gray-100 p-2 rounded-lg">
                <mat-icon class="text-gray-600">payments</mat-icon>
              </div>
              <div>
                <h4 class="font-bold text-sm">Cash After Service</h4>
                <p class="text-[10px] text-gray-500">Pay directly to technician</p>
              </div>
            </div>
            <mat-icon class="text-gray-300">chevron_right</mat-icon>
          </div>
        </div>
      </div>

      <p class="text-center text-[10px] text-gray-400 px-8">
        By paying, you agree to GharFix Terms of Service and Privacy Policy.
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Payment implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  serviceId = signal<string>('');
  serviceName = signal<string>('');
  serviceIcon = signal<string>('build');
  amount = signal<number>(199);
  upiId = '9905870112@ibl';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.serviceId.set(params['id']);
      this.serviceName.set(this.capitalize(params['id']));
      this.setServiceDetails(params['id']);
    });

    // Override amount if passed in query params
    const queryPrice = this.route.snapshot.queryParams['price'];
    if (queryPrice) {
      this.amount.set(Number(queryPrice));
    }
  }

  capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  setServiceDetails(id: string) {
    const details: Record<string, { icon: string, price: number }> = {
      electrician: { icon: 'bolt', price: 500 },
      plumber: { icon: 'water_drop', price: 599 },
      ac: { icon: 'ac_unit', price: 599 },
      decorator: { icon: 'auto_awesome', price: 1200 }, // Base price for decoration
      carpenter: { icon: 'handyman', price: 600 },
    };
    const d = details[id] || { icon: 'build', price: 500 };
    this.serviceIcon.set(d.icon);
    this.amount.set(d.price);
  }

  goBack() {
    this.router.navigate(['/booking', this.serviceId()]);
  }

  payViaUPI() {
    // Simulate successful payment and navigate to success screen
    const q = this.route.snapshot.queryParams;
    const address = q['address'];
    const name = q['name'];
    const mobile = q['mobile'];
    const floor = q['floor'];
    const roomNo = q['roomNo'];

    // Save real order to shared storage ONLY after payment
    this.orderService.addOrder({
      customer: name || 'Customer',
      mobile: mobile || '',
      service: this.serviceName(),
      price: this.amount(),
      address: address || '',
      floor: floor || '',
      roomNo: roomNo || '',
      paymentType: 'online'
    });

    setTimeout(() => {
      this.router.navigate(['/success', this.serviceId()], {
        queryParams: { address, name, floor, roomNo }
      });
    }, 1000);
  }

  payViaCash() {
    const q = this.route.snapshot.queryParams;
    const address = q['address'];
    const name = q['name'];
    const mobile = q['mobile'];
    const floor = q['floor'];
    const roomNo = q['roomNo'];

    this.orderService.addOrder({
      customer: name || 'Customer',
      mobile: mobile || '',
      service: this.serviceName(),
      price: this.amount(),
      address: address || '',
      floor: floor || '',
      roomNo: roomNo || '',
      paymentType: 'cash'
    });

    this.router.navigate(['/success', this.serviceId()], {
      queryParams: { address, name, floor, roomNo }
    });
  }
}
