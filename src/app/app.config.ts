import {
  ApplicationConfig,
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAMPPOwAvZPT6kJz8fVXYWWPEGQGHRa6-E',
  authDomain: 'house-460c8.firebaseapp.com',
  projectId: 'house-460c8',
  storageBucket: 'house-460c8.firebasestorage.app',
  messagingSenderId: '839568466136',
  appId: '1:839568466136:web:3411a9e689b4ee388db7ad'
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ],
};
