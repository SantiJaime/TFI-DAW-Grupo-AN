import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';
import { FechaQueryDto } from './fecha-query.dto';

export class DisponibilidadQueryDto extends FechaQueryDto {
  @ApiProperty({ example: 1, description: 'ID del médico' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id_medico: number;
}
