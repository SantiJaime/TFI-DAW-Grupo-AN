import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CreatePacienteDto } from '../usuarios/dto/create-paciente.dto';
import { UsuarioResponseDto } from '../usuarios/dto/usuario-response.dto';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @ApiOperation({ summary: 'Registrarse como paciente (público)' })
  @ApiCreatedResponse({ type: UsuarioResponseDto })
  @ApiConflictResponse({ description: 'Documento o email ya registrado' })
  async registrar(
    @Body() createPacienteDto: CreatePacienteDto,
  ): Promise<UsuarioResponseDto> {
    const usuario = await this.authService.registrar(createPacienteDto);
    return new UsuarioResponseDto(usuario);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión (solo usuarios ACTIVOS)' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Credenciales incorrectas o usuario dado de baja',
  })
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }
}
