import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FiltroUsuariosDto } from './dto/filtro-usuarios.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { EstadoUsuario, RolUsuario } from 'src/enums/usuario.enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async createPaciente(createPacienteDto: CreatePacienteDto) {
    await this.validarDatosUnicos(
      createPacienteDto.documento,
      createPacienteDto.email,
    );

    const usuario = this.usuariosRepository.create({
      ...createPacienteDto,
      clave: await this.hashearClave(createPacienteDto.clave),
      rol: RolUsuario.PACIENTE,
      estado: EstadoUsuario.ACTIVO,
    });

    return await this.usuariosRepository.save(usuario);
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const { matricula, valor_consulta, ...datosUsuario } = createUsuarioDto;
    await this.validarDatosUnicos(datosUsuario.documento, datosUsuario.email);

    const clave = await this.hashearClave(datosUsuario.clave);

    return await this.usuariosRepository.manager.transaction(
      async (manager) => {
        const usuario = await manager.save(
          manager.create(Usuario, {
            ...datosUsuario,
            clave,
            estado: EstadoUsuario.ACTIVO,
          }),
        );

        if (usuario.rol === RolUsuario.MEDICO) {
          await manager.save(
            manager.create(Medico, {
              id_usuario: usuario.id,
              matricula,
              valor_consulta,
            }),
          );
        }

        return usuario;
      },
    );
  }

  async findAll(filtro: FiltroUsuariosDto = {}) {
    const where: FindOptionsWhere<Usuario> = {};
    if (filtro.rol) where.rol = filtro.rol;
    if (filtro.estado) where.estado = filtro.estado;

    return await this.usuariosRepository.find({
      where,
      order: { apellidos: 'ASC', nombres: 'ASC' },
    });
  }

  async findOne(id: number) {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario || usuario.estado === EstadoUsuario.BAJA) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async findById(id: number) {
    return await this.usuariosRepository.findOneBy({ id });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);
    await this.validarDatosUnicos(
      updateUsuarioDto.documento,
      updateUsuarioDto.email,
      id,
    );

    if (updateUsuarioDto.clave) {
      updateUsuarioDto.clave = await this.hashearClave(updateUsuarioDto.clave);
    }

    this.usuariosRepository.merge(usuario, updateUsuarioDto);
    return await this.usuariosRepository.save(usuario);
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);
    usuario.estado = EstadoUsuario.BAJA;
    return await this.usuariosRepository.save(usuario);
  }

  async findByEmail(email: string) {
    return await this.usuariosRepository.findOne({ where: { email } });
  }

  private async validarDatosUnicos(
    documento?: string,
    email?: string,
    idExcluido?: number,
  ) {
    const id = idExcluido ? Not(idExcluido) : undefined;

    if (documento) {
      const where: FindOptionsWhere<Usuario> = { documento };
      if (id) where.id = id;
      if (await this.usuariosRepository.existsBy(where)) {
        throw new ConflictException('Ya existe un usuario con ese documento');
      }
    }

    if (email) {
      const where: FindOptionsWhere<Usuario> = { email };
      if (id) where.id = id;
      if (await this.usuariosRepository.existsBy(where)) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
    }
  }

  private async hashearClave(clave: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(clave, salt);
  }
}
