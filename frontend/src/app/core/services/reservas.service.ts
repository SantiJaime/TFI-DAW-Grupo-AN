import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateReservaRequest,
  Disponibilidad,
  FiltroReservas,
  Reserva,
} from '../models/reserva.models';

const DIAS_MAXIMOS_ANTICIPACION = 30;

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
  canPatientCancel(fechaHora: string | Date): boolean {
    const cita = new Date(fechaHora);
    const ahora = new Date();
    const citaFechaSolo = new Date(cita.getFullYear(), cita.getMonth(), cita.getDate()).getTime();
    const hoyFechaSolo = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
    return citaFechaSolo > hoyFechaSolo;
  }

  /** El administrador puede cancelar hasta que empiece el turno */
  canAdminCancel(fechaHora: string | Date): boolean {
    return new Date(fechaHora).getTime() > Date.now();
  }

  getMinDate(): string {
    return this.formatearYMD(new Date());
  }

  getMaxDate(): string {
    const max = new Date();
    max.setDate(max.getDate() + DIAS_MAXIMOS_ANTICIPACION);
    return this.formatearYMD(max);
  }

  formatearYMD(fecha: Date): string {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  }
}
