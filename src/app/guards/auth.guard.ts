import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // ✅ Get token from localStorage (or sessionStorage)
  const token = localStorage.getItem('authToken');

  if (token) {
    // Token exists → allow access
    return true;
  } else {
    // No token → redirect to login
    router.navigate(['/login']);
    return false;
  }
};
