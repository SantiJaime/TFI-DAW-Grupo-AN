import { EstadoUsuario, RolUsuario } from '../enums/usuario.enums';

export interface Usuario {
  id: number;
  documento: string;
  apellidos: string;
  nombres: string;
  email: string;
  estado: EstadoUsuario;
  rol: RolUsuario;
}

export interface FiltroUsuarios {
  rol?: RolUsuario;
  estado?: EstadoUsuario;
}
