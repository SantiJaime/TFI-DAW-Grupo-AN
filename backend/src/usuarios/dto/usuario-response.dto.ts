import { ApiProperty } from '@nestjs/swagger';
import { EstadoUsuario, RolUsuario } from '../../enums/usuario.enums';
import { Usuario } from '../entities/usuario.entity';

export class UsuarioResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '40123456' })
  documento: string;

  @ApiProperty({ example: 'Pérez' })
  apellidos: string;

  @ApiProperty({ example: 'Juan' })
  nombres: string;

  @ApiProperty({ example: 'juan@clinica.com' })
  email: string;

  @ApiProperty({ enum: EstadoUsuario, example: EstadoUsuario.ACTIVO })
  estado: EstadoUsuario;

  @ApiProperty({ enum: RolUsuario, example: RolUsuario.PACIENTE })
  rol: RolUsuario;

  constructor(usuario: Usuario) {
    this.id = usuario.id;
    this.documento = usuario.documento;
    this.apellidos = usuario.apellidos;
    this.nombres = usuario.nombres;
    this.email = usuario.email;
    this.estado = usuario.estado;
    this.rol = usuario.rol;
  }
}
