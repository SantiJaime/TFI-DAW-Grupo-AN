import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { EstadoUsuario } from 'src/enums/usuario.enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuario = this.usuariosRepository.create(createUsuarioDto);
    usuario.estado = EstadoUsuario.ACTIVO;

    const salt = await bcrypt.genSalt(10);
    usuario.clave = await bcrypt.hash(createUsuarioDto.clave, salt);

    return await this.usuariosRepository.save(usuario);
  }

  async findAll() {
    return await this.usuariosRepository.find();
  }

  async findOne(id: number) {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario || usuario.estado === EstadoUsuario.BAJA) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario || usuario.estado === EstadoUsuario.BAJA) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateUsuarioDto.clave) {
      const salt = await bcrypt.genSalt(10);
      updateUsuarioDto.clave = await bcrypt.hash(updateUsuarioDto.clave, salt);
    }

    this.usuariosRepository.merge(usuario, updateUsuarioDto);
    return await this.usuariosRepository.save(usuario);
  }

  remove(id: number) {
    return `Remover usuario ${id}`;
  }

  async findByEmail(email: string) {
    return await this.usuariosRepository.findOne({ where: { email } });
  }
}