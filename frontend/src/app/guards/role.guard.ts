import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  const currentRole = authService.userRole;

  if (authService.isLoggedIn && currentRole && allowedRoles?.includes(currentRole)) {
    return true;
  }

  if (authService.isLoggedIn) {
    if (currentRole === 'MEDICO') {
      router.navigate(['/medico']);
    } else if (currentRole === 'PACIENTE') {
      router.navigate(['/paciente']);
    } else if (currentRole === 'ADMINISTRADOR') {
      router.navigate(['/admin']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  router.navigate(['/login']);
  return false;
};
