import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  Matches,
} from 'class-validator';
import { EstadoReserva } from '../../enums/estado-reserva.enum';
import { FORMATO_FECHA } from './fecha-query.dto';

export class FiltroReservasDto {
  @ApiPropertyOptional({ example: '2026-10-20', description: 'YYYY-MM-DD' })
  @Matches(FORMATO_FECHA, { message: 'fecha debe tener formato YYYY-MM-DD' })
  @IsOptional()
  fecha?: string;

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  id_medico?: number;

  @ApiPropertyOptional({ example: 5 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  id_paciente?: number;

  @ApiPropertyOptional({ enum: EstadoReserva })
  @IsEnum(EstadoReserva)
  @IsOptional()
  estado?: EstadoReserva;
}
