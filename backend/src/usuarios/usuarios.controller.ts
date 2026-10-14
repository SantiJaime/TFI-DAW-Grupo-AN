import {
  Controller,
  UseGuards,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FiltroUsuariosDto } from './dto/filtro-usuarios.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../enums/usuario.enums';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Roles(RolUsuario.ADMINISTRADOR)
@UseGuards(AuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un médico o administrador (administrador)',
  })
  @ApiCreatedResponse({ type: UsuarioResponseDto })
  @ApiConflictResponse({ description: 'Documento o email ya registrado' })
  async create(
    @Body() createUsuarioDto: CreateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    const usuario = await this.usuariosService.create(createUsuarioDto);
    return new UsuarioResponseDto(usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios (filtrable por rol y estado)' })
  @ApiOkResponse({ type: UsuarioResponseDto, isArray: true })
  async findAll(
    @Query() filtro: FiltroUsuariosDto,
  ): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.usuariosService.findAll(filtro);
    const usuariosDto = usuarios.map((u) => new UsuarioResponseDto(u));
    return usuariosDto;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario' })
  @ApiOkResponse({ type: UsuarioResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UsuarioResponseDto> {
    const usuario = await this.usuariosService.findOne(id);
    return new UsuarioResponseDto(usuario);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar un usuario' })
  @ApiOkResponse({ type: UsuarioResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    const usuario = await this.usuariosService.update(id, updateUsuarioDto);
    return new UsuarioResponseDto(usuario);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Dar de baja un usuario (baja lógica)' })
  @ApiOkResponse({ type: UsuarioResponseDto })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UsuarioResponseDto> {
    const usuario = await this.usuariosService.remove(id);
    return new UsuarioResponseDto(usuario);
  }
}
