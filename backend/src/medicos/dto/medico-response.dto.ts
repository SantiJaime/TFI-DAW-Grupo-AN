import { ApiProperty } from '@nestjs/swagger';
import { Medico } from '../entities/medico.entity';

export class MedicoResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 2 })
  id_usuario: number;

  @ApiProperty({ example: 12345 })
  matricula: number;

  @ApiProperty({ example: 25000 })
  valor_consulta: number;

  @ApiProperty({ example: 'Gómez' })
  apellidos: string;

  @ApiProperty({ example: 'Laura' })
  nombres: string;

  @ApiProperty({ example: 'laura.gomez@clinica.com' })
  email: string;

  constructor(medico: Medico) {
    this.id = medico.id;
    this.id_usuario = medico.id_usuario;
    this.matricula = medico.matricula;
    this.valor_consulta = medico.valor_consulta;
    this.apellidos = medico.usuario.apellidos;
    this.nombres = medico.usuario.nombres;
    this.email = medico.usuario.email;
  }
}
