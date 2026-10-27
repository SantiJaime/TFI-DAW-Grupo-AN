import { EstadoUsuario, RolUsuario } from 'src/enums/usuario.enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'text' })
  documento: string;

  @Column({ type: 'text' })
  apellidos: string;

  @Column({ type: 'text' })
  nombres: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  clave: string;

  @Column({ type: 'enum', enum: EstadoUsuario, enumName: 'estados_usuarios' })
  estado: EstadoUsuario;

  @Column({ type: 'enum', enum: RolUsuario, enumName: 'roles_usuarios' })
  rol: RolUsuario;
}
