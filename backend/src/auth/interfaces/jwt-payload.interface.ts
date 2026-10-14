import { RolUsuario } from '../../enums/usuario.enums';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: RolUsuario;
  id_medico: number | null;
}

declare module 'express' {
  interface Request {
    usuario?: JwtPayload;
  }
}
