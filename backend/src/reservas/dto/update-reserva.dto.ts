import { PartialType } from '@nestjs/mapped-types';
import { CreateReservaDto } from './create-reserva.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoReserva } from '../../enums/estado-reserva.enum';

export class UpdateReservaDto extends PartialType(CreateReservaDto) {
  @IsEnum(EstadoReserva)
  @IsOptional()
  estado?: EstadoReserva;
}