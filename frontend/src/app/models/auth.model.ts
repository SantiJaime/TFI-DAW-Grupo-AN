import { RolUsuario, Usuario } from './usuario.model';

export interface LoginDto {
  email: string;
  clave: string;
}

export interface AuthResponseDto {
  access_token: string;
  usuario: {
    id: number;
    rol: RolUsuario;
  };
}

export interface CurrentUserSession {
  token: string;
  id: number;
  rol: RolUsuario;
  usuario?: Usuario;
  medicoId?: number;
}
