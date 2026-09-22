import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity({ name: 'medicos' })
export class Medico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  id_usuario: number;

  @Column({ type: 'int' })
  matricula: number;

  @Column({ type: 'int' })
  valor_consulta: number;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}