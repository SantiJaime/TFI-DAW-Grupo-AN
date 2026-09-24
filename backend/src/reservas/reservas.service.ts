import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from './entities/reserva.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { Medico } from '../medicos/entities/medico.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createReservaDto: CreateReservaDto) {
    const { id_medico, id_paciente, fecha_hora } = createReservaDto;
    const fechaReserva = new Date(fecha_hora);
    const ahora = new Date();
    
    const limite = new Date();
    limite.setDate(ahora.getDate() + 30);

    if (fechaReserva < ahora || fechaReserva > limite) {
      throw new BadRequestException('La reserva debe ser hasta 30 días en el futuro');
    }

    const hora = fechaReserva.getHours();
    const minutos = fechaReserva.getMinutes();

    if (hora < 8 || hora >= 16 || minutos !== 0) {
      throw new BadRequestException('El horario de atención es de 08:00 a 16:00 en turnos de 1 hora exacta');
    }

    const medico = await this.medicoRepository.findOneBy({ id: id_medico });
    if (!medico) throw new NotFoundException('Médico no encontrado');

    const paciente = await this.usuarioRepository.findOneBy({ id: id_paciente });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    const reserva = this.reservaRepository.create({
      medico,
      paciente,
      fecha_hora: fechaReserva,
      valor_consulta: medico.valor_consulta,
    });

    return await this.reservaRepository.save(reserva);
  }

  async findAll() {
    return await this.reservaRepository.find({
      relations: { medico: { usuario: true }, paciente: true },
    });
  }

  async findOne(id: number) {
    const reserva = await this.reservaRepository.findOne({
      where: { id },
      relations: { medico: { usuario: true }, paciente: true },
    });
    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    return reserva;
  }

  async update(id: number, updateReservaDto: UpdateReservaDto) {
    const reserva = await this.findOne(id);
    Object.assign(reserva, updateReservaDto);
    return await this.reservaRepository.save(reserva);
  }

  async remove(id: number) {
    const reserva = await this.findOne(id);
    return await this.reservaRepository.remove(reserva);
  }
}