import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class UpdateValorConsultaDto {
  @ApiProperty({ example: 30000, description: 'Nuevo valor de la consulta' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  valor_consulta: number;
}
