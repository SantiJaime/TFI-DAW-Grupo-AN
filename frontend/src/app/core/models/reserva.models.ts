import { EstadoReserva } from '../enums/reserva.enums';

export interface ReservaMedico {
  id: number;
  matricula: number;
  apellidos: string;
  nombres: string;
}

export interface ReservaPaciente {
  id: number;
  documento: string;
  apellidos: string;
  nombres: string;
}

export interface Reserva {
  id: number;
  fecha_hora: string;
  estado: EstadoReserva;
  valor_consulta: number;
  medico: ReservaMedico;
  paciente: ReservaPaciente;
}

export interface CreateReservaRequest {
  id_medico: number;
  id_paciente?: number;
  fecha_hora: string;
}

export interface FiltroReservas {
  fecha?: string;
  id_medico?: number;
  id_paciente?: number;
  estado?: EstadoReserva;
}

export interface Disponibilidad {
  fecha_hora: string;
  disponible: boolean;
}
