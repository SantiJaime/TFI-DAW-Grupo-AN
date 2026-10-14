import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export class FechaQueryDto {
  @ApiProperty({
    example: '2026-10-20',
    description: 'Fecha en formato YYYY-MM-DD',
  })
  @Matches(FORMATO_FECHA, { message: 'fecha debe tener formato YYYY-MM-DD' })
  @IsNotEmpty()
  fecha: string;
}
