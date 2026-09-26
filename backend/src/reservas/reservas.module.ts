import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { Reserva } from './entities/reserva.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Medico, Usuario])],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}