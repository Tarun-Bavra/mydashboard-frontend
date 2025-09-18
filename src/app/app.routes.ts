// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard'; // ✅ guard import

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./components/signup/signup.component').then(
        (m) => m.SignupComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard], // ✅ protected route
  },
  {
    path: 'alarms',
    loadComponent: () =>
      import('./components/alarm/alarm-list.component').then(
        (m) => m.AlarmListComponent
      ),
    canActivate: [authGuard], // ✅ also protected
  },
  {
    path: 'alarms/create', // ✅ new route for creating alarms
    loadComponent: () =>
      import('./components/alarm/alarm-create.component').then(
        (m) => m.AlarmCreateComponent
      ),
    canActivate: [authGuard], // ✅ protected
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login', // ✅ fallback for unknown routes
  },
];
