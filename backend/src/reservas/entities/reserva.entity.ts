import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Medico } from '../../medicos/entities/medico.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { EstadoReserva } from '../../enums/estado-reserva.enum';

@Index('UQ_reserva_medico_horario', ['id_medico', 'fecha_hora'], {
  unique: true,
  where: `"estado" <> '${EstadoReserva.CANCELADO}'`,
})
@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  id_medico: number;

  @Column({ type: 'int' })
  id_paciente: number;

  @ManyToOne(() => Medico)
  @JoinColumn({ name: 'id_medico' })
  medico: Medico;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_paciente' })
  paciente: Usuario;

  @Column({ type: 'timestamp' })
  fecha_hora: Date;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
    default: EstadoReserva.ACTIVO,
  })
  estado: EstadoReserva;

  @Column({ type: 'int' })
  valor_consulta: number;
}
