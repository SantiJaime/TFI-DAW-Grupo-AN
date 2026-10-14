import { ApiProperty } from '@nestjs/swagger';

export class DisponibilidadResponseDto {
  @ApiProperty({ example: '2026-10-20T13:00:00.000Z' })
  fecha_hora: Date;

  @ApiProperty({ example: true })
  disponible: boolean;

  constructor(fechaHora: Date, disponible: boolean) {
    this.fecha_hora = fechaHora;
    this.disponible = disponible;
  }
}
