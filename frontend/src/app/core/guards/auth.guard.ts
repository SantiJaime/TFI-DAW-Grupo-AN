import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RolUsuario } from '../enums/usuario.enums';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.estaLogueado() || inject(Router).createUrlTree(['/login']);
};

export const invitadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return !authService.estaLogueado() || inject(Router).createUrlTree(['/inicio']);
};

// Requiere que el rol del usuario esté en route.data.roles; si no, lo manda a su panel
export const rolGuard: CanActivateFn = (route) => {
  const rol = inject(AuthService).usuario()?.rol;
  const rolesPermitidos = (route.data['roles'] as RolUsuario[] | undefined) ?? [];
  return (rol && rolesPermitidos.includes(rol)) || inject(Router).createUrlTree(['/inicio']);
};
