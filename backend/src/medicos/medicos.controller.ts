import {
  Controller,
  UseGuards,
  Get,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MedicosService } from './medicos.service';
import { UpdateValorConsultaDto } from './dto/update-valor-consulta.dto';
import { MedicoResponseDto } from './dto/medico-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../enums/usuario.enums';

@ApiTags('Médicos')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar médicos activos' })
  @ApiOkResponse({ type: MedicoResponseDto, isArray: true })
  async findAll(): Promise<MedicoResponseDto[]> {
    const medicos = await this.medicosService.findAll();
    const medicosDto = medicos.map((m) => new MedicoResponseDto(m));
    return medicosDto;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un médico' })
  @ApiOkResponse({ type: MedicoResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MedicoResponseDto> {
    const medico = await this.medicosService.findOne(id);
    return new MedicoResponseDto(medico);
  }

  @Patch(':id/valor-consulta')
  @Roles(RolUsuario.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Modificar el valor de la consulta de un médico (administrador)',
  })
  @ApiOkResponse({ type: MedicoResponseDto })
  async updateValorConsulta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateValorConsultaDto,
  ): Promise<MedicoResponseDto> {
    const medico = await this.medicosService.updateValorConsulta(id, dto);
    return new MedicoResponseDto(medico);
  }
}
