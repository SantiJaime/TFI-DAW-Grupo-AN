import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MedicoDashboardComponent } from './pages/medico/medico-dashboard.component';
import { PacienteDashboardComponent } from './pages/paciente/paciente-dashboard.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'medico',
    component: MedicoDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MEDICO'] }
  },
  {
    path: 'paciente',
    component: PacienteDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PACIENTE'] }
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR'] }
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
