import { IsInt, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateReservaDto {
  @IsInt()
  @IsNotEmpty()
  id_medico: number;

  @IsInt()
  @IsNotEmpty()
  id_paciente: number;

  @IsDateString()
  @IsNotEmpty()
  fecha_hora: string;
}