import { RolUsuario } from '../enums/usuario.enums';

export interface LoginRequest {
  email: string;
  clave: string;
}

export interface UsuarioLogueado {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: RolUsuario;
  id_medico: number | null;
}

export interface LoginResponse {
  access_token: string;
  usuario: UsuarioLogueado;
}
