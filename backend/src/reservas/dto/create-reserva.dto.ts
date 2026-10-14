import {
  IsInt,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservaDto {
  @ApiProperty({ example: 1, description: 'ID del médico (tabla medicos)' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_medico: number;

  @ApiPropertyOptional({
    example: 5,
    description:
      'ID del usuario paciente. Obligatorio para administradores; ' +
      'para pacientes se toma del token y este campo se ignora.',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  id_paciente?: number;

  @ApiProperty({
    example: '2026-10-20T10:00:00',
    description: 'Fecha y hora del turno (hora en punto, entre 08:00 y 15:00)',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha_hora: string;
}
