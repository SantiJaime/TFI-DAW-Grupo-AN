import { ApiProperty } from '@nestjs/swagger';
import { RolUsuario } from '../../enums/usuario.enums';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export class UsuarioLogueadoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Juan' })
  nombres: string;

  @ApiProperty({ example: 'Pérez' })
  apellidos: string;

  @ApiProperty({ example: 'juan@clinica.com' })
  email: string;

  @ApiProperty({ enum: RolUsuario, example: RolUsuario.PACIENTE })
  rol: RolUsuario;

  @ApiProperty({
    nullable: true,
    type: Number,
    example: null,
    description: 'ID en la tabla medicos (solo para usuarios con rol MEDICO)',
  })
  id_medico: number | null;

  constructor(usuario: Usuario, idMedico: number | null) {
    this.id = usuario.id;
    this.nombres = usuario.nombres;
    this.apellidos = usuario.apellidos;
    this.email = usuario.email;
    this.rol = usuario.rol;
    this.id_medico = idMedico;
  }
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ type: () => UsuarioLogueadoDto })
  usuario: UsuarioLogueadoDto;

  constructor(accessToken: string, usuario: Usuario, idMedico: number | null) {
    this.access_token = accessToken;
    this.usuario = new UsuarioLogueadoDto(usuario, idMedico);
  }
}
