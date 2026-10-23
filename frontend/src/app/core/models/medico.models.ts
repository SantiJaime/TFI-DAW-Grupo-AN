export interface Medico {
  id: number;
  id_usuario: number;
  matricula: number;
  valor_consulta: number;
  apellidos: string;
  nombres: string;
  email: string;
}

export interface UpdateValorConsultaRequest {
  valor_consulta: number;
}
