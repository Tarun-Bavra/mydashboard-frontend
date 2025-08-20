import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('authToken');
  if (token) {
    return true; // ✅ user is logged in
  }

  // ❌ not logged in → redirect to login
  router.navigate(['/login']);
  return false;
};
