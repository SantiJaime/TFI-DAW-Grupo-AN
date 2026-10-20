import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.estaLogueado() || inject(Router).createUrlTree(['/login']);
};

export const invitadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return !authService.estaLogueado() || inject(Router).createUrlTree(['/inicio']);
};
