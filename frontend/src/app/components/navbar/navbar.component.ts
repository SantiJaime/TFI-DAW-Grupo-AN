import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <div class="brand">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6v12m-6-6h12"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">Clínica Médica</span>
            <span class="brand-subtitle">Portal de Turnos</span>
          </div>
        </div>

        @if (authService.isLoggedIn) {
          <div class="nav-links">
            @if (userRole === 'PACIENTE') {
              <a routerLink="/paciente" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Mis Turnos</span>
              </a>
            }

            @if (userRole === 'MEDICO') {
              <a routerLink="/medico" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <span>Agenda Médica</span>
              </a>
            }

            @if (userRole === 'ADMINISTRADOR') {
              <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Panel de Administración</span>
              </a>
            }
          </div>

          <div class="nav-user">
            <div class="user-badge" [class]="userRoleClass">
              <span class="role-pill">{{ userRoleLabel }}</span>
              <span class="user-name">{{ userName }}</span>
            </div>
            <button class="btn-logout" (click)="logout()" title="Cerrar sesión">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Salir</span>
            </button>
          </div>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.2);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
    }
    .brand-subtitle {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      color: #475569;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .nav-link:hover {
      background: #f1f5f9;
      color: #0284c7;
    }
    .nav-link.active {
      background: #e0f2fe;
      color: #0369a1;
      font-weight: 600;
    }
    .nav-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-badge {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .role-pill {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      background: #f1f5f9;
      color: #475569;
    }
    .role-admin .role-pill {
      background: #fef3c7;
      color: #b45309;
    }
    .role-medico .role-pill {
      background: #e0e7ff;
      color: #4338ca;
    }
    .role-paciente .role-pill {
      background: #dcfce7;
      color: #15803d;
    }
    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
    }
    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.85rem;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-logout:hover {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #b91c1c;
    }
    @media (max-width: 640px) {
      .brand-subtitle, .user-name {
        display: none;
      }
      .nav-link span, .btn-logout span {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get userRole(): string | null {
    return this.authService.userRole;
  }

  get userRoleClass(): string {
    const role = this.authService.userRole;
    if (role === 'ADMINISTRADOR') return 'role-admin';
    if (role === 'MEDICO') return 'role-medico';
    if (role === 'PACIENTE') return 'role-paciente';
    return '';
  }

  get userRoleLabel(): string {
    const role = this.authService.userRole;
    if (role === 'ADMINISTRADOR') return 'Administrador';
    if (role === 'MEDICO') return 'Médico';
    if (role === 'PACIENTE') return 'Paciente';
    return 'Usuario';
  }

  get userName(): string {
    const u = this.authService.session?.usuario;
    if (u) {
      return `${u.nombres} ${u.apellidos}`;
    }
    return this.authService.session?.token ? 'Usuario' : '';
  }

  logout(): void {
    this.authService.logout();
  }
}
