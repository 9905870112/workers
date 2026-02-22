import { Routes } from '@angular/router';
import { Home } from './home';
import { Booking } from './booking';
import { Payment } from './payment';
import { Worker } from './worker';
import { Profile } from './profile';
import { Login } from './login';
import { Manager } from './manager';
import { Success } from './success';
import { WorkerDashboard } from './worker-dashboard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'booking/:id', component: Booking },
  { path: 'payment/:id', component: Payment },
  { path: 'worker', component: Worker },
  { path: 'worker-dashboard', component: WorkerDashboard },
  { path: 'profile', component: Profile },
  { path: 'login', component: Login },
  { path: 'manager', component: Manager },
  { path: 'success/:id', component: Success },
  { path: '**', redirectTo: '' }
];
