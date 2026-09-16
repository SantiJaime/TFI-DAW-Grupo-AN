import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EstadoUsuario, RolUsuario } from 'src/enums/usuario.enums';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  documento: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  clave: string;

  @IsEnum(EstadoUsuario)
  @IsNotEmpty()
  estado: EstadoUsuario;

  @IsEnum(RolUsuario)
  @IsNotEmpty()
  rol: RolUsuario;
}
