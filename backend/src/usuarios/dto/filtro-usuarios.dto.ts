import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoUsuario, RolUsuario } from '../../enums/usuario.enums';

export class FiltroUsuariosDto {
  @ApiPropertyOptional({ enum: RolUsuario })
  @IsEnum(RolUsuario)
  @IsOptional()
  rol?: RolUsuario;

  @ApiPropertyOptional({ enum: EstadoUsuario })
  @IsEnum(EstadoUsuario)
  @IsOptional()
  estado?: EstadoUsuario;
}
