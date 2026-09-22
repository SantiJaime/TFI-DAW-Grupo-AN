import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateMedicoDto {
  @IsInt()
  @IsNotEmpty()
  id_usuario: number;

  @IsInt()
  @IsNotEmpty()
  matricula: number;

  @IsInt()
  @IsNotEmpty()
  valor_consulta: number;
}