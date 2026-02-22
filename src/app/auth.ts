import { Injectable, signal, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';

export type UserRole = 'customer' | 'worker' | 'manager' | null;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  currentUser = signal<{ role: UserRole; id: string; name: string } | null>(null);
  private managers = signal<Record<string, { phone: string, pass: string, name: string }>>({});

  login(role: UserRole, id: string, name: string) {
    this.currentUser.set({ role, id, name });
    if (typeof window !== 'undefined') {
      localStorage.setItem('gharfax_user', JSON.stringify({ role, id, name }));
    }
  }

  loginWorker(id: string, pass: string): boolean {
    if (id === '969310' && pass === '2514') {
      this.login('worker', id, 'Expert Worker');
      return true;
    }
    return false;
  }

  registerManager(id: string, phone: string, pass: string, name: string) {
    const current = this.managers();
    current[id] = { phone, pass, name };
    this.managers.set({ ...current });
    if (typeof window !== 'undefined') {
      localStorage.setItem('gharfax_managers', JSON.stringify(current));
    }
  }

  getManager(id: string) {
    return this.managers()[id];
  }

  logout() {
    this.currentUser.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gharfax_user');
    }
  }

  init() {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('gharfax_user');
      if (savedUser) {
        this.currentUser.set(JSON.parse(savedUser));
      }
      const savedManagers = localStorage.getItem('gharfax_managers');
      if (savedManagers) {
        this.managers.set(JSON.parse(savedManagers));
      }
    }
  }
}
