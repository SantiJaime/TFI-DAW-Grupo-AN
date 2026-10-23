import { EstadoReserva } from '../enums/reserva.enums';

type Severidad = 'info' | 'success' | 'warn' | 'danger' | 'secondary';

export const ESTADOS_RESERVA: Record<EstadoReserva, { etiqueta: string; severidad: Severidad }> = {
  [EstadoReserva.ACTIVO]: { etiqueta: 'Activo', severidad: 'info' },
  [EstadoReserva.ATENDIDO]: { etiqueta: 'Atendido', severidad: 'success' },
  [EstadoReserva.AUSENTE]: { etiqueta: 'Ausente', severidad: 'warn' },
  [EstadoReserva.CANCELADO]: { etiqueta: 'Cancelado', severidad: 'secondary' },
};

export function formatearYMD(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}
