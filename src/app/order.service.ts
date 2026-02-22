import { Injectable, signal } from '@angular/core';

export interface Order {
  id: string;
  customer: string;
  mobile: string;
  service: string;
  time: string;
  price: number;
  address: string;
  floor?: string;
  roomNo?: string;
  worker: string;
  status: 'pending' | 'verified' | 'completed';
  paymentType: 'cash' | 'online';
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders = signal<Order[]>([]);

  constructor() {
    this.loadOrders();
  }

  private loadOrders() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gharfax_orders');
      if (saved) {
        this.orders.set(JSON.parse(saved));
      }
    }
  }

  getOrders() {
    return this.orders;
  }

  addOrder(order: Omit<Order, 'id' | 'time' | 'worker' | 'status'>) {
    const newOrder: Order = {
      ...order,
      id: 'ORD' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      worker: 'Assigning...',
      status: 'pending'
    };

    this.orders.update(current => {
      const updated = [newOrder, ...current];
      if (typeof window !== 'undefined') {
        localStorage.setItem('gharfax_orders', JSON.stringify(updated));
      }
      return updated;
    });
    return newOrder;
  }

  updateStatus(id: string, status: 'pending' | 'verified' | 'completed') {
    this.orders.update(current => {
      const updated = current.map(o => o.id === id ? { ...o, status } : o);
      if (typeof window !== 'undefined') {
        localStorage.setItem('gharfax_orders', JSON.stringify(updated));
      }
      return updated;
    });
  }

  verifyOrder(id: string) {
    this.updateStatus(id, 'verified');
  }

  completeOrder(id: string) {
    this.updateStatus(id, 'completed');
  }
}
