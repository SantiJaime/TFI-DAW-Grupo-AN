import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UsuarioLogueado } from '../models/auth.models';

const CLAVE_TOKEN = 'clinica_token';
const CLAVE_USUARIO = 'clinica_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = '/api/v1/auth';

  private readonly _token = signal<string | null>(null);
  private readonly _usuario = signal<UsuarioLogueado | null>(null);

  readonly token = this._token.asReadonly();
  readonly usuario = this._usuario.asReadonly();
  readonly estaLogueado = computed(() => this._token() !== null);

  constructor() {
    this.restaurarSesion();
  }

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credenciales)
      .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
  }

  logout(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this._token.set(null);
    this._usuario.set(null);
    this.router.navigate(['/login']);
  }

  private guardarSesion({ access_token, usuario }: LoginResponse): void {
    localStorage.setItem(CLAVE_TOKEN, access_token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    this._token.set(access_token);
    this._usuario.set(usuario);
  }

  private restaurarSesion(): void {
    const token = localStorage.getItem(CLAVE_TOKEN);
    const usuario = localStorage.getItem(CLAVE_USUARIO);

    if (!token || !usuario || this.tokenExpirado(token)) {
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_USUARIO);
      return;
    }

    try {
      this._usuario.set(JSON.parse(usuario) as UsuarioLogueado);
      this._token.set(token);
    } catch {
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_USUARIO);
    }
  }

  private tokenExpirado(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
