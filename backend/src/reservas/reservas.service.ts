import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  FindOptionsWhere,
  LessThan,
  MoreThanOrEqual,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { Reserva } from './entities/reserva.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { FiltroReservasDto } from './dto/filtro-reservas.dto';
import { DisponibilidadResponseDto } from './dto/disponibilidad-response.dto';
import { Medico } from '../medicos/entities/medico.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { EstadoReserva } from '../enums/estado-reserva.enum';
import { EstadoUsuario, RolUsuario } from '../enums/usuario.enums';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

const HORA_APERTURA = 8;
const HORA_CIERRE = 16;
const DIAS_MAXIMOS_ANTICIPACION = 30;

const RELACIONES = { medico: { usuario: true }, paciente: true };

const UNIQUE_VIOLATION = '23505';

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

  async create(createReservaDto: CreateReservaDto, usuario: JwtPayload) {
    const idPaciente =
      usuario.rol === RolUsuario.PACIENTE
        ? usuario.sub
        : createReservaDto.id_paciente;
    if (!idPaciente) {
      throw new BadRequestException('Debe indicar el paciente (id_paciente)');
    }

    const fechaHora = new Date(createReservaDto.fecha_hora);
    this.validarHorarioReservable(fechaHora);

    const medico = await this.buscarMedicoActivo(createReservaDto.id_medico);

    const paciente = await this.usuarioRepository.findOneBy({
      id: idPaciente,
    });
    if (
      !paciente ||
      paciente.rol !== RolUsuario.PACIENTE ||
      paciente.estado !== EstadoUsuario.ACTIVO
    ) {
      throw new NotFoundException('Paciente no encontrado o inactivo');
    }

    const ocupado = await this.reservaRepository.exists({
      where: {
        id_medico: medico.id,
        fecha_hora: fechaHora,
        estado: Not(EstadoReserva.CANCELADO),
      },
    });
    if (ocupado) {
      throw new ConflictException('El horario seleccionado ya está ocupado');
    }

    const reserva = this.reservaRepository.create({
      id_medico: medico.id,
      id_paciente: paciente.id,
      fecha_hora: fechaHora,
      estado: EstadoReserva.ACTIVO,
      valor_consulta: medico.valor_consulta,
    });

    try {
      const guardada = await this.reservaRepository.save(reserva);
      return await this.buscarReserva(guardada.id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === UNIQUE_VIOLATION
      ) {
        throw new ConflictException('El horario seleccionado ya está ocupado');
      }
      throw error;
    }
  }

  async findAll(filtro: FiltroReservasDto) {
    const where: FindOptionsWhere<Reserva> = {};
    if (filtro.id_medico) where.id_medico = filtro.id_medico;
    if (filtro.id_paciente) where.id_paciente = filtro.id_paciente;
    if (filtro.estado) where.estado = filtro.estado;
    if (filtro.fecha) where.fecha_hora = this.rangoDelDia(filtro.fecha);

    return await this.reservaRepository.find({
      where,
      relations: RELACIONES,
      order: { fecha_hora: 'ASC' },
    });
  }

  async findByPaciente(idPaciente: number) {
    return await this.reservaRepository.find({
      where: { id_paciente: idPaciente },
      relations: RELACIONES,
      order: { fecha_hora: 'ASC' },
    });
  }

  async findByMedicoYFecha(usuario: JwtPayload, fecha: string) {
    const idMedico = this.idMedicoDe(usuario);
    return await this.reservaRepository.find({
      where: {
        id_medico: idMedico,
        fecha_hora: this.rangoDelDia(fecha),
        estado: Not(EstadoReserva.CANCELADO),
      },
      relations: RELACIONES,
      order: { fecha_hora: 'ASC' },
    });
  }

  async findOne(id: number, usuario: JwtPayload) {
    const reserva = await this.buscarReserva(id);
    this.verificarAcceso(reserva, usuario);
    return reserva;
  }

  async cancelar(id: number, usuario: JwtPayload) {
    const reserva = await this.buscarReserva(id);
    this.verificarAcceso(reserva, usuario);

    if (reserva.estado !== EstadoReserva.ACTIVO) {
      throw new BadRequestException('Solo se pueden cancelar turnos activos');
    }

    const ahora = new Date();
    if (usuario.rol === RolUsuario.PACIENTE) {
      const inicioDiaTurno = new Date(reserva.fecha_hora);
      inicioDiaTurno.setHours(0, 0, 0, 0);
      if (ahora >= inicioDiaTurno) {
        throw new BadRequestException(
          'Los pacientes solo pueden cancelar turnos hasta el día anterior a la consulta',
        );
      }
    } else if (ahora >= reserva.fecha_hora) {
      throw new BadRequestException(
        'No se puede cancelar un turno que ya comenzó',
      );
    }

    reserva.estado = EstadoReserva.CANCELADO;
    return await this.reservaRepository.save(reserva);
  }

  async marcarAsistencia(
    id: number,
    usuario: JwtPayload,
    estado: EstadoReserva.ATENDIDO | EstadoReserva.AUSENTE,
  ) {
    const reserva = await this.buscarReserva(id);
    if (reserva.id_medico !== this.idMedicoDe(usuario)) {
      throw new ForbiddenException('El turno no pertenece a este médico');
    }
    if (reserva.estado !== EstadoReserva.ACTIVO) {
      throw new BadRequestException(
        `No se puede modificar un turno en estado ${reserva.estado}`,
      );
    }

    reserva.estado = estado;
    return await this.reservaRepository.save(reserva);
  }

  async disponibilidad(
    idMedico: number,
    fecha: string,
  ): Promise<DisponibilidadResponseDto[]> {
    await this.buscarMedicoActivo(idMedico);

    const ocupadas = await this.reservaRepository.find({
      select: { fecha_hora: true },
      where: {
        id_medico: idMedico,
        fecha_hora: this.rangoDelDia(fecha),
        estado: Not(EstadoReserva.CANCELADO),
      },
    });
    const horariosOcupados = new Set(
      ocupadas.map((r) => r.fecha_hora.getTime()),
    );

    const inicioDia = this.parsearFecha(fecha);
    const horarios: DisponibilidadResponseDto[] = [];
    for (let hora = HORA_APERTURA; hora < HORA_CIERRE; hora++) {
      const fechaHora = new Date(inicioDia);
      fechaHora.setHours(hora);
      const disponible =
        !horariosOcupados.has(fechaHora.getTime()) &&
        this.estaEnRangoReservable(fechaHora);
      horarios.push(new DisponibilidadResponseDto(fechaHora, disponible));
    }
    return horarios;
  }

  private async buscarReserva(id: number) {
    const reserva = await this.reservaRepository.findOne({
      where: { id },
      relations: RELACIONES,
    });
    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    return reserva;
  }

  private async buscarMedicoActivo(id: number) {
    const medico = await this.medicoRepository.findOne({
      where: { id },
      relations: { usuario: true },
    });
    if (!medico || medico.usuario.estado !== EstadoUsuario.ACTIVO) {
      throw new NotFoundException('Médico no encontrado o inactivo');
    }
    return medico;
  }

  private verificarAcceso(reserva: Reserva, usuario: JwtPayload) {
    const esPropia =
      usuario.rol === RolUsuario.ADMINISTRADOR ||
      (usuario.rol === RolUsuario.PACIENTE &&
        reserva.id_paciente === usuario.sub) ||
      (usuario.rol === RolUsuario.MEDICO &&
        reserva.id_medico === usuario.id_medico);

    if (!esPropia) {
      throw new ForbiddenException('No tiene acceso a esta reserva');
    }
  }

  private idMedicoDe(usuario: JwtPayload) {
    if (!usuario.id_medico) {
      throw new ForbiddenException('El usuario no está registrado como médico');
    }
    return usuario.id_medico;
  }

  private validarHorarioReservable(fechaHora: Date) {
    if (isNaN(fechaHora.getTime())) {
      throw new BadRequestException('Fecha y hora inválidas');
    }

    const hora = fechaHora.getHours();
    if (
      hora < HORA_APERTURA ||
      hora >= HORA_CIERRE ||
      fechaHora.getMinutes() !== 0 ||
      fechaHora.getSeconds() !== 0 ||
      fechaHora.getMilliseconds() !== 0
    ) {
      throw new BadRequestException(
        'El horario de atención es de 08:00 a 16:00 en turnos de 1 hora exacta',
      );
    }

    if (!this.estaEnRangoReservable(fechaHora)) {
      throw new BadRequestException(
        `La reserva debe ser a futuro y con un máximo de ${DIAS_MAXIMOS_ANTICIPACION} días de anticipación`,
      );
    }
  }

  private estaEnRangoReservable(fechaHora: Date) {
    const ahora = new Date();
    const limite = new Date(ahora);
    limite.setDate(limite.getDate() + DIAS_MAXIMOS_ANTICIPACION);
    return fechaHora > ahora && fechaHora <= limite;
  }

  private parsearFecha(fecha: string) {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const resultado = new Date(anio, mes - 1, dia);
    if (
      resultado.getFullYear() !== anio ||
      resultado.getMonth() !== mes - 1 ||
      resultado.getDate() !== dia
    ) {
      throw new BadRequestException('Fecha inválida');
    }
    return resultado;
  }

  private rangoDelDia(fecha: string) {
    const inicio = this.parsearFecha(fecha);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 1);
    return And(MoreThanOrEqual(inicio), LessThan(fin));
  }
}
