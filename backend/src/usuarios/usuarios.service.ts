import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { EstadoUsuario } from 'src/enums/usuario.enums';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}
  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuario = this.usuariosRepository.create(createUsuarioDto);
    usuario.estado = EstadoUsuario.ACTIVO;

    return await this.usuariosRepository.save(usuario);
  }

  async findAll() {
    const usuarios = await this.usuariosRepository.find();
    return usuarios;
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

    this.usuariosRepository.merge(usuario, updateUsuarioDto);
    return await this.usuariosRepository.save(usuario);
  }

  remove(id: number) {
    return `Remover usuario ${id}`;
  }
}
