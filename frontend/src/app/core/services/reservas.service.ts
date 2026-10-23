import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateReservaRequest,
  Disponibilidad,
  FiltroReservas,
  Reserva,
} from '../models/reserva.models';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/reservas';

  /** Todas las reservas (solo ADMINISTRADOR) */
  getReservas(filtro: FiltroReservas = {}): Observable<Reserva[]> {
    const params = new HttpParams({ fromObject: { ...filtro } });
    return this.http.get<Reserva[]>(this.apiUrl, { params });
  }

  /** Reservas del paciente logueado */
  getMisReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/mias`);
  }

  /** Turnos del médico logueado en una fecha (YYYY-MM-DD) */
  getMisTurnos(fecha: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/mis-turnos`, { params: { fecha } });
  }

  /** Horarios de un médico en una fecha (YYYY-MM-DD), indicando si están libres */
  getDisponibilidad(idMedico: number, fecha: string): Observable<Disponibilidad[]> {
    return this.http.get<Disponibilidad[]>(`${this.apiUrl}/disponibilidad`, {
      params: { id_medico: idMedico, fecha },
    });
  }

  getReserva(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`);
  }

  createReserva(body: CreateReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, body);
  }

  cancelarReserva(id: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  marcarAtendido(id: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${id}/atendido`, {});
  }

  marcarAusente(id: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${id}/ausente`, {});
  }

  /** El paciente puede cancelar hasta el día anterior al turno */
  pacientePuedeCancelar(fechaHora: string): boolean {
    const turno = new Date(fechaHora);
    turno.setHours(0, 0, 0, 0);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return turno.getTime() > hoy.getTime();
  }

  /** El administrador puede cancelar hasta que empiece el turno */
  adminPuedeCancelar(fechaHora: string): boolean {
    return new Date(fechaHora).getTime() > Date.now();
  }
}
