import { IsIn, IsInt, IsPositive, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RolUsuario } from '../../enums/usuario.enums';
import { CreatePacienteDto } from './create-paciente.dto';

export class CreateUsuarioDto extends CreatePacienteDto {
  @ApiProperty({
    enum: [RolUsuario.MEDICO, RolUsuario.ADMINISTRADOR],
    example: RolUsuario.MEDICO,
  })
  @IsIn([RolUsuario.MEDICO, RolUsuario.ADMINISTRADOR], {
    message: 'rol debe ser MEDICO o ADMINISTRADOR',
  })
  rol: RolUsuario.MEDICO | RolUsuario.ADMINISTRADOR;

  @ApiPropertyOptional({
    example: 12345,
    description: 'Obligatorio si el rol es MEDICO',
  })
  @ValidateIf((dto: CreateUsuarioDto) => dto.rol === RolUsuario.MEDICO)
  @IsInt()
  @IsPositive()
  matricula?: number;

  @ApiPropertyOptional({
    example: 25000,
    description: 'Obligatorio si el rol es MEDICO',
  })
  @ValidateIf((dto: CreateUsuarioDto) => dto.rol === RolUsuario.MEDICO)
  @IsInt()
  @IsPositive()
  valor_consulta?: number;
}
