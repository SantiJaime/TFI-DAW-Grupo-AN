import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Medico } from './entities/medico.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MedicosService {
  constructor(
    @InjectRepository(Medico)
    private readonly medicosRepository: Repository<Medico>,
  ) {}

  async create(createMedicoDto: CreateMedicoDto) {
    const medico = this.medicosRepository.create(createMedicoDto);
    return await this.medicosRepository.save(medico);
  }

  async findAll() {
    return await this.medicosRepository.find({ relations: { usuario: true } });
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

  async update(id: number, updateMedicoDto: UpdateMedicoDto) {
    const medico = await this.findOne(id);
    this.medicosRepository.merge(medico, updateMedicoDto);
    return await this.medicosRepository.save(medico);
  }

  async remove(id: number) {
    const medico = await this.findOne(id);
    return await this.medicosRepository.remove(medico);
  }
}