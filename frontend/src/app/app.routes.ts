import { inject } from '@angular/core';
import { RedirectFunction, Router, Routes } from '@angular/router';
import { RolUsuario } from './core/enums/usuario.enums';
import { authGuard, invitadoGuard, rolGuard } from './core/guards/auth.guard';
import { AuthService } from './core/services/auth.service';

const RUTA_POR_ROL: Record<RolUsuario, string> = {
  [RolUsuario.MEDICO]: '/medico',
  [RolUsuario.PACIENTE]: '/paciente',
  [RolUsuario.ADMINISTRADOR]: '/admin',
};

const redirigirSegunRol: RedirectFunction = () => {
  const rol = inject(AuthService).usuario()?.rol;
  return inject(Router).parseUrl(rol ? RUTA_POR_ROL[rol] : '/login');
};

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'medico',
    canActivate: [authGuard, rolGuard],
    data: { roles: [RolUsuario.MEDICO] },
    loadComponent: () => import('./pages/medico/medico').then((m) => m.PanelMedico),
  },
  {
    path: 'paciente',
    canActivate: [authGuard, rolGuard],
    data: { roles: [RolUsuario.PACIENTE] },
    loadComponent: () => import('./pages/paciente/paciente').then((m) => m.PanelPaciente),
  },
  {
    path: 'admin',
    canActivate: [authGuard, rolGuard],
    data: { roles: [RolUsuario.ADMINISTRADOR] },
    loadComponent: () => import('./pages/admin/admin').then((m) => m.PanelAdmin),
  },
  { path: 'inicio', redirectTo: redirigirSegunRol },
  { path: '', pathMatch: 'full', redirectTo: redirigirSegunRol },
  { path: '**', redirectTo: redirigirSegunRol },
];
