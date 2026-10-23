import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, switchMap, of, map, catchError } from 'rxjs';
import { AuthResponseDto, CurrentUserSession, LoginDto } from '../models/auth.model';
import { Usuario } from '../models/usuario.model';
import { Medico } from '../models/medico.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly STORAGE_KEY = 'clinica_auth_session';
  readonly sessionSignal = signal<CurrentUserSession | null>(this.getStoredSession());

  constructor() {
    const session = this.sessionSignal();
    if (session?.token && session.id && !session.usuario) {
      this.refreshUserData(session.id).subscribe();
    }
  }

  get session(): CurrentUserSession | null {
    return this.sessionSignal();
  }

  get isLoggedIn(): boolean {
    return !!this.sessionSignal()?.token;
  }

  get userRole(): string | null {
    return this.sessionSignal()?.rol ?? null;
  }

  get currentUserId(): number | null {
    return this.sessionSignal()?.id ?? null;
  }

  get currentMedicoId(): number | null {
    return this.sessionSignal()?.medicoId ?? null;
  }

  login(loginDto: LoginDto): Observable<CurrentUserSession> {
    return this.http.post<AuthResponseDto>('/api/v1/auth/login', loginDto).pipe(
      switchMap((authResponse) => {
        const baseSession: CurrentUserSession = {
          token: authResponse.access_token,
          id: authResponse.usuario.id,
          rol: authResponse.usuario.rol
        };

        this.saveSession(baseSession);

        return this.http.get<Usuario>(`/api/v1/usuarios/${baseSession.id}`).pipe(
          switchMap((usuario) => {
            if (usuario.estado !== 'ACTIVO') {
              this.logout();
              throw new Error('El usuario no está activo en el sistema');
            }

            baseSession.usuario = usuario;

            if (baseSession.rol === 'MEDICO') {
              return this.http.get<Medico[]>('/api/v1/medicos').pipe(
                map((medicos) => {
                  const medicoFound = medicos.find((m) => m.id_usuario === baseSession.id || m.usuario?.id === baseSession.id);
                  if (medicoFound) {
                    baseSession.medicoId = medicoFound.id;
                  }
                  this.saveSession(baseSession);
                  return baseSession;
                }),
                catchError(() => {
                  this.saveSession(baseSession);
                  return of(baseSession);
                })
              );
            }

            this.saveSession(baseSession);
            return of(baseSession);
          })
        );
      })
    );
  }

  refreshUserData(id: number): Observable<Usuario | null> {
    return this.http.get<Usuario>(`/api/v1/usuarios/${id}`).pipe(
      tap((usuario) => {
        const session = this.sessionSignal();
        if (session) {
          session.usuario = usuario;
          this.saveSession(session);
        }
      }),
      catchError(() => of(null))
    );
  }

  saveSession(session: CurrentUserSession): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Error al guardar sesión en localStorage', e);
    }
    this.sessionSignal.set({ ...session });
  }

  private getStoredSession(): CurrentUserSession | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  logout(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    this.sessionSignal.set(null);
    this.router.navigate(['/login']);
  }
}
