import { Usuario } from './usuario.model';

export interface Medico {
  id: number;
  id_usuario: number;
  matricula: number;
  valor_consulta: number;
  usuario?: Usuario;
}

export interface CreateMedicoDto {
  id_usuario: number;
  matricula: number;
  valor_consulta: number;
}

export interface UpdateMedicoDto {
  id_usuario?: number;
  matricula?: number;
  valor_consulta?: number;
}
