import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { MedicosService } from '../medicos/medicos.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreatePacienteDto } from '../usuarios/dto/create-paciente.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { EstadoUsuario, RolUsuario } from '../enums/usuario.enums';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private medicosService: MedicosService,
    private jwtService: JwtService,
  ) {}

  async registrar(createPacienteDto: CreatePacienteDto) {
    return await this.usuariosService.createPaciente(createPacienteDto);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const usuario = await this.usuariosService.findByEmail(loginDto.email);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.clave, usuario.clave);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (usuario.estado !== EstadoUsuario.ACTIVO) {
      throw new UnauthorizedException('El usuario se encuentra dado de baja');
    }

    let idMedico: number | null = null;
    if (usuario.rol === RolUsuario.MEDICO) {
      const medico = await this.medicosService.findByUsuarioId(usuario.id);
      idMedico = medico?.id ?? null;
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      id_medico: idMedico,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return new LoginResponseDto(accessToken, usuario, idMedico);
  }
}
