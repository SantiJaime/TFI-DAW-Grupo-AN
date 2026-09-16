import { EstadoUsuario, RolUsuario } from 'src/enums/usuario.enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  document: string;

  @Column()
  apellidos: string;

  @Column()
  nombres: string;

  @Column()
  email: string;

  @Column()
  clave: string;

  @Column({ type: 'enum', enum: EstadoUsuario })
  estado: EstadoUsuario;

  @Column({ type: 'enum', enum: RolUsuario })
  rol: RolUsuario;
}
