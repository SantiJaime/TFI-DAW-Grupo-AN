import { ApiProperty } from '@nestjs/swagger';
import { EstadoReserva } from '../../enums/estado-reserva.enum';
import { Reserva } from '../entities/reserva.entity';
import { Medico } from '../../medicos/entities/medico.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export class ReservaMedicoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 12345 })
  matricula: number;

  @ApiProperty({ example: 'Gómez' })
  apellidos: string;

  @ApiProperty({ example: 'Laura' })
  nombres: string;

  constructor(medico: Medico) {
    this.id = medico.id;
    this.matricula = medico.matricula;
    this.apellidos = medico.usuario.apellidos;
    this.nombres = medico.usuario.nombres;
  }
}

export class ReservaPacienteDto {
  @ApiProperty({ example: 5 })
  id: number;

  @ApiProperty({ example: '40123456' })
  documento: string;

  @ApiProperty({ example: 'Pérez' })
  apellidos: string;

  @ApiProperty({ example: 'Juan' })
  nombres: string;

  constructor(paciente: Usuario) {
    this.id = paciente.id;
    this.documento = paciente.documento;
    this.apellidos = paciente.apellidos;
    this.nombres = paciente.nombres;
  }
}

export class ReservaResponseDto {
  @ApiProperty({ example: 10 })
  id: number;

  @ApiProperty({ example: '2026-10-20T13:00:00.000Z' })
  fecha_hora: Date;

  @ApiProperty({ enum: EstadoReserva, example: EstadoReserva.ACTIVO })
  estado: EstadoReserva;

  @ApiProperty({
    example: 25000,
    description: 'Valor congelado al momento de la reserva',
  })
  valor_consulta: number;

  @ApiProperty({ type: () => ReservaMedicoDto })
  medico: ReservaMedicoDto;

  @ApiProperty({ type: () => ReservaPacienteDto })
  paciente: ReservaPacienteDto;

  constructor(reserva: Reserva) {
    this.id = reserva.id;
    this.fecha_hora = reserva.fecha_hora;
    this.estado = reserva.estado;
    this.valor_consulta = reserva.valor_consulta;
    this.medico = new ReservaMedicoDto(reserva.medico);
    this.paciente = new ReservaPacienteDto(reserva.paciente);
  }
}
