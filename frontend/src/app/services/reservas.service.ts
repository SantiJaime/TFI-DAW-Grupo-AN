import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateReservaDto, Reserva, UpdateReservaDto } from '../models/reserva.model';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/reservas';

  readonly HORARIOS_DISPONIBLES: number[] = [8, 9, 10, 11, 12, 13, 14, 15];

  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.baseUrl);
  }

  getReserva(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.baseUrl}/${id}`);
  }

  createReserva(dto: CreateReservaDto): Observable<Reserva> {
    return this.http.post<Reserva>(this.baseUrl, dto);
  }

  updateReserva(id: number, dto: UpdateReservaDto): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.baseUrl}/${id}`, dto);
  }

  cancelarReserva(id: number): Observable<Reserva> {
    return this.updateReserva(id, { estado: 'CANCELADA' });
  }

  marcarAtendido(id: number): Observable<Reserva> {
    return this.updateReserva(id, { estado: 'ASISTIO' });
  }

  marcarAusente(id: number): Observable<Reserva> {
    return this.updateReserva(id, { estado: 'CANCELADA' });
  }

  canPatientCancel(fechaHora: string | Date): boolean {
    const cita = new Date(fechaHora);
    const ahora = new Date();

    const citaFechaSolo = new Date(cita.getFullYear(), cita.getMonth(), cita.getDate()).getTime();
    const hoyFechaSolo = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();

    return citaFechaSolo > hoyFechaSolo;
  }

  canAdminCancel(fechaHora: string | Date): boolean {
    const cita = new Date(fechaHora);
    return cita.getTime() > Date.now();
  }

  isHorarioOcupado(
    medicoId: number,
    fechaIsoYMD: string,
    hora: number,
    reservas: Reserva[]
  ): boolean {
    return reservas.some((r) => {
      if (r.estado === 'CANCELADA') {
        return false;
      }

      if (r.medico?.id !== medicoId) {
        return false;
      }

      const fechaCita = new Date(r.fecha_hora);
      const ymd = `${fechaCita.getFullYear()}-${String(fechaCita.getMonth() + 1).padStart(2, '0')}-${String(fechaCita.getDate()).padStart(2, '0')}`;
      const horaCita = fechaCita.getHours();

      return ymd === fechaIsoYMD && horaCita === hora;
    });
  }

  getMinDate(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  }

  getMaxDate(): string {
    const max = new Date();
    max.setDate(max.getDate() + 30);
    return `${max.getFullYear()}-${String(max.getMonth() + 1).padStart(2, '0')}-${String(max.getDate()).padStart(2, '0')}`;
  }
}
