import { Medico } from './medico.model';
import { Usuario } from './usuario.model';

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'ASISTIO';

export interface Reserva {
  id: number;
  medico: Medico;
  paciente: Usuario;
  fecha_hora: string;
  estado: EstadoReserva;
  valor_consulta: number;
}

export interface CreateReservaDto {
  id_medico: number;
  id_paciente: number;
  fecha_hora: string;
}

export interface UpdateReservaDto {
  id_medico?: number;
  id_paciente?: number;
  fecha_hora?: string;
  estado?: EstadoReserva;
}
