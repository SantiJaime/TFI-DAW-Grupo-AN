import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // Buscamos al usuario por su email
    const usuario = await this.usuariosService.findByEmail(loginDto.email);
    
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Comparamos la contraseña en texto plano con el hash de la base de datos
    const isPasswordValid = await bcrypt.compare(loginDto.clave, usuario.clave);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Armamos el token con los datos que nos importan
    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        rol: usuario.rol
      }
    };
  }
}