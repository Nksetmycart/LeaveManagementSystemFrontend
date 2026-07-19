import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const roleGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[];
  const userRole = authService.getRole();

  if (allowedRoles.includes(userRole)){
    return true;
  }


  router.navigate(['/unauthorized']);
  return true;
};
