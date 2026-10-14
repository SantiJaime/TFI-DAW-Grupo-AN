import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateValorConsultaDto } from './dto/update-valor-consulta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Medico } from './entities/medico.entity';
import { Repository } from 'typeorm';
import { EstadoUsuario } from '../enums/usuario.enums';

@Injectable()
export class MedicosService {
  constructor(
    @InjectRepository(Medico)
    private readonly medicosRepository: Repository<Medico>,
  ) {}

  async findAll() {
    return await this.medicosRepository.find({
      where: { usuario: { estado: EstadoUsuario.ACTIVO } },
      relations: { usuario: true },
      order: { usuario: { apellidos: 'ASC', nombres: 'ASC' } },
    });
  }

  async findOne(id: number) {
    const medico = await this.medicosRepository.findOne({
      where: { id },
      relations: { usuario: true },
    });
    if (!medico) {
      throw new NotFoundException('Médico no encontrado');
    }
    return medico;
  }

  async findByUsuarioId(idUsuario: number) {
    return await this.medicosRepository.findOne({
      where: { id_usuario: idUsuario },
      relations: { usuario: true },
    });
  }

  async updateValorConsulta(id: number, dto: UpdateValorConsultaDto) {
    const medico = await this.findOne(id);
    medico.valor_consulta = dto.valor_consulta;
    return await this.medicosRepository.save(medico);
  }
}
