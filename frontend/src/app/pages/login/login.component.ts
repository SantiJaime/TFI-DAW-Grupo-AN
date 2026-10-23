import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginDto } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="brand-badge">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6v12m-6-6h12"/>
            </svg>
          </div>
          <h2>Clínica Médica</h2>
          <p class="subtitle">Ingrese sus credenciales para acceder al sistema</p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <div class="input-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="ejemplo@clinica.com"
                [class.invalid]="isFieldInvalid('email')"
              />
            </div>
            @if (isFieldInvalid('email')) {
              <small class="field-error">Ingrese un correo electrónico válido.</small>
            }
          </div>

          <div class="form-group">
            <label for="clave">Contraseña</label>
            <div class="input-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="clave"
                type="password"
                formControlName="clave"
                placeholder="••••••••"
                [class.invalid]="isFieldInvalid('clave')"
              />
            </div>
            @if (isFieldInvalid('clave')) {
              <small class="field-error">La contraseña es requerida.</small>
            }
          </div>

          <button
            type="submit"
            class="btn-submit"
            [disabled]="loginForm.invalid || isLoading()"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              <span>Ingresando...</span>
            } @else {
              <span>Iniciar Sesión</span>
            }
          </button>
        </form>

        <div class="demo-box">
          <div class="demo-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <strong>Acceso Rápido para Pruebas / Video:</strong>
          </div>
          <p class="demo-text">Seleccione un perfil para auto-completar credenciales válidas:</p>
          <div class="demo-buttons">
            <button type="button" class="btn-demo admin" (click)="fillDemo('admin@clinica.com', 'admin123')">
              Administrador
            </button>
            <button type="button" class="btn-demo medico" (click)="fillDemo('roberto.gomez@clinica.com', 'medico123')">
              Médico
            </button>
            <button type="button" class="btn-demo paciente" (click)="fillDemo('daniel@test.com', 'password123')">
              Paciente
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: calc(100vh - 70px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%);
      padding: 2rem 1rem;
    }
    .login-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
      padding: 2.5rem;
      width: 100%;
      max-width: 440px;
    }
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .brand-badge {
      width: 56px;
      height: 56px;
      margin: 0 auto 1rem;
      border-radius: 14px;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 15px -3px rgba(2, 132, 199, 0.3);
    }
    .login-header h2 {
      font-size: 1.6rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem;
    }
    .subtitle {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
    }
    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-radius: 10px;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }
    .alert-error {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #334155;
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-wrapper svg {
      position: absolute;
      left: 1rem;
      color: #94a3b8;
      pointer-events: none;
    }
    .input-wrapper input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.6rem;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s ease;
      background: #f8fafc;
    }
    .input-wrapper input:focus {
      background: #ffffff;
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
    }
    .input-wrapper input.invalid {
      border-color: #ef4444;
      background: #fff5f5;
    }
    .field-error {
      color: #ef4444;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .btn-submit {
      margin-top: 0.5rem;
      padding: 0.85rem;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.25);
    }
    .btn-submit:hover:not(:disabled) {
      background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
      transform: translateY(-1px);
    }
    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid white;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .demo-box {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px dashed #e2e8f0;
    }
    .demo-header {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: #475569;
      margin-bottom: 0.4rem;
    }
    .demo-text {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0 0 0.6rem;
    }
    .demo-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .btn-demo {
      flex: 1;
      padding: 0.4rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid;
      background: white;
      transition: all 0.15s ease;
      text-align: center;
    }
    .btn-demo.admin {
      border-color: #fde68a;
      color: #b45309;
      background: #fffbeb;
    }
    .btn-demo.admin:hover {
      background: #fef3c7;
    }
    .btn-demo.medico {
      border-color: #c7d2fe;
      color: #4338ca;
      background: #eef2ff;
    }
    .btn-demo.medico:hover {
      background: #e0e7ff;
    }
    .btn-demo.paciente {
      border-color: #bbf7d0;
      color: #15803d;
      background: #f0fdf4;
    }
    .btn-demo.paciente:hover {
      background: #dcfce7;
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.required]]
  });

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  isFieldInvalid(field: 'email' | 'clave'): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  fillDemo(email: string, clave: string): void {
    this.loginForm.patchValue({ email, clave });
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const dto: LoginDto = {
      email: this.loginForm.value.email!.trim(),
      clave: this.loginForm.value.clave!
    };

    this.authService.login(dto).subscribe({
      next: (session) => {
        this.isLoading.set(false);
        if (session.rol === 'MEDICO') {
          this.router.navigate(['/medico']);
        } else if (session.rol === 'PACIENTE') {
          this.router.navigate(['/paciente']);
        } else if (session.rol === 'ADMINISTRADOR') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Credenciales inválidas. Por favor verifique correo y contraseña.');
        } else if (err.message && err.message.includes('no está activo')) {
          this.errorMessage.set('Su cuenta se encuentra inactiva. Contacte a la administración.');
        } else {
          this.errorMessage.set('Error al conectar con el servidor. Intente nuevamente.');
        }
      }
    });
  }
}
