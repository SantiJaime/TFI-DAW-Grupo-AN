export type RolUsuario = 'MEDICO' | 'PACIENTE' | 'ADMINISTRADOR';
export type EstadoUsuario = 'ACTIVO' | 'BAJA';

export interface Usuario {
  id: number;
  documento: string;
  apellidos: string;
  nombres: string;
  email: string;
  estado: EstadoUsuario;
  rol: RolUsuario;
}

export interface CreateUsuarioDto {
  documento: string;
  apellidos: string;
  nombres: string;
  email: string;
  clave: string;
  rol: RolUsuario;
}

export interface UpdateUsuarioDto {
  documento?: string;
  apellidos?: string;
  nombres?: string;
  email?: string;
  clave?: string;
  estado?: EstadoUsuario;
  rol?: RolUsuario;
}
