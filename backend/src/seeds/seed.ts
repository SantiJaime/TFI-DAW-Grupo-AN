import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { EstadoUsuario, RolUsuario } from '../enums/usuario.enums';
import { Medico } from '../medicos/entities/medico.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

const CLAVE = 'test123';

const usuariosSeed = [
  {
    documento: '30111222',
    apellidos: 'Admin',
    nombres: 'Alejandra',
    email: 'admin@clinica.com',
    rol: RolUsuario.ADMINISTRADOR,
  },
  {
    documento: '28333444',
    apellidos: 'Gómez',
    nombres: 'Martín',
    email: 'medico@clinica.com',
    rol: RolUsuario.MEDICO,
  },
  {
    documento: '40555666',
    apellidos: 'Pérez',
    nombres: 'Lucía',
    email: 'paciente@clinica.com',
    rol: RolUsuario.PACIENTE,
  },
];

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    synchronize: (process.env.DB_SYNCHRONIZE ?? 'true') === 'true',
    entities: [Usuario, Medico, Reserva],
  });
  await dataSource.initialize();

  const usuarios = dataSource.getRepository(Usuario);
  const medicos = dataSource.getRepository(Medico);
  const claveHash = await bcrypt.hash(CLAVE, 10);

  for (const datos of usuariosSeed) {
    let usuario = await usuarios.findOneBy({ email: datos.email });
    if (usuario) {
      console.log(`Ya existe: ${datos.email}`);
    } else {
      usuario = await usuarios.save(
        usuarios.create({
          ...datos,
          clave: claveHash,
          estado: EstadoUsuario.ACTIVO,
        }),
      );
      console.log(`Creado: ${datos.email} (${datos.rol})`);
    }

    if (
      usuario.rol === RolUsuario.MEDICO &&
      !(await medicos.existsBy({ id_usuario: usuario.id }))
    ) {
      await medicos.save(
        medicos.create({
          id_usuario: usuario.id,
          matricula: 12345,
          valor_consulta: 15000,
        }),
      );
      console.log(`Creado perfil de médico para ${usuario.email}`);
    }
  }

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Error al ejecutar el seed:', err);
  process.exit(1);
});
