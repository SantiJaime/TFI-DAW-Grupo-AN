import {
  Controller,
  UseGuards,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { FiltroReservasDto } from './dto/filtro-reservas.dto';
import { FechaQueryDto } from './dto/fecha-query.dto';
import { DisponibilidadQueryDto } from './dto/disponibilidad-query.dto';
import { ReservaResponseDto } from './dto/reserva-response.dto';
import { DisponibilidadResponseDto } from './dto/disponibilidad-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { RolUsuario } from '../enums/usuario.enums';
import { EstadoReserva } from '../enums/estado-reserva.enum';

@ApiTags('Reservas')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @Roles(RolUsuario.PACIENTE, RolUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Reservar un turno (paciente o administrador)' })
  @ApiCreatedResponse({ type: ReservaResponseDto })
  async create(
    @Body() createReservaDto: CreateReservaDto,
    @UsuarioActual() usuario: JwtPayload,
  ): Promise<ReservaResponseDto> {
    const reserva = await this.reservasService.create(
      createReservaDto,
      usuario,
    );
    return new ReservaResponseDto(reserva);
  }

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar todas las reservas (administrador)' })
  @ApiOkResponse({ type: ReservaResponseDto, isArray: true })
  async findAll(
    @Query() filtro: FiltroReservasDto,
  ): Promise<ReservaResponseDto[]> {
    const reservas = await this.reservasService.findAll(filtro);
    const reservasDto = reservas.map((r) => new ReservaResponseDto(r));
    return reservasDto;
  }

  @Get('mias')
  @Roles(RolUsuario.PACIENTE)
  @ApiOperation({ summary: 'Listar mis reservas (paciente)' })
  @ApiOkResponse({ type: ReservaResponseDto, isArray: true })
  async findMias(
    @UsuarioActual() usuario: JwtPayload,
  ): Promise<ReservaResponseDto[]> {
    const reservas = await this.reservasService.findByPaciente(usuario.sub);
    const misReservasDto = reservas.map((r) => new ReservaResponseDto(r));
    return misReservasDto;
  }

  @Get('mis-turnos')
  @Roles(RolUsuario.MEDICO)
  @ApiOperation({ summary: 'Listar mis turnos de una fecha (médico)' })
  @ApiOkResponse({ type: ReservaResponseDto, isArray: true })
  async findMisTurnos(
    @Query() { fecha }: FechaQueryDto,
    @UsuarioActual() usuario: JwtPayload,
  ): Promise<ReservaResponseDto[]> {
    const reservas = await this.reservasService.findByMedicoYFecha(
      usuario,
      fecha,
    );
    const misTurnosDto = reservas.map((r) => new ReservaResponseDto(r));
    return misTurnosDto;
  }

  @Get('disponibilidad')
  @ApiOperation({ summary: 'Horarios disponibles de un médico en una fecha' })
  @ApiOkResponse({ type: DisponibilidadResponseDto, isArray: true })
  disponibilidad(
    @Query() { id_medico, fecha }: DisponibilidadQueryDto,
  ): Promise<DisponibilidadResponseDto[]> {
    return this.reservasService.disponibilidad(id_medico, fecha);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reserva propia' })
  @ApiOkResponse({ type: ReservaResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: JwtPayload,
  ): Promise<ReservaResponseDto> {
    const reserva = await this.reservasService.findOne(id, usuario);
    return new ReservaResponseDto(reserva);
  }

  @Patch(':id/cancelar')
  @Roles(RolUsuario.PACIENTE, RolUsuario.ADMINISTRADOR)
  @ApiOperation({
    summary:
      'Cancelar un turno (paciente: hasta el día anterior; administrador: hasta que inicia)',
  })
  @ApiOkResponse({ type: ReservaResponseDto })
  async cancelar(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: JwtPayload,
  ): Promise<ReservaResponseDto> {
    const reserva = await this.reservasService.cancelar(id, usuario);
    return new ReservaResponseDto(reserva);
  }

  @Patch(':id/atendido')
  @Roles(RolUsuario.MEDICO)
  @ApiOperation({ summary: 'Marcar un turno como atendido (médico)' })
  @ApiOkResponse({ type: ReservaResponseDto })
  async marcarAtendido(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: JwtPayload,
  ): Promise<ReservaResponseDto> {
    const reserva = await this.reservasService.marcarAsistencia(
      id,
      usuario,
      EstadoReserva.ATENDIDO,
    );
    return new ReservaResponseDto(reserva);
  }

  @Patch(':id/ausente')
  @Roles(RolUsuario.MEDICO)
  @ApiOperation({ summary: 'Marcar un turno como ausente (médico)' })
  @ApiOkResponse({ type: ReservaResponseDto })
  async marcarAusente(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: JwtPayload,
  ): Promise<ReservaResponseDto> {
    const reserva = await this.reservasService.marcarAsistencia(
      id,
      usuario,
      EstadoReserva.AUSENTE,
    );
    return new ReservaResponseDto(reserva);
  }
}
