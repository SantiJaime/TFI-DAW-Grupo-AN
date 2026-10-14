import { Controller, Get, Req, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AppService } from './app.service';
import { EstadoApiResponseDto } from './dto/estado-api-response.dto';

@ApiTags('Estado')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Version(VERSION_NEUTRAL)
  @ApiOperation({
    summary: 'Estado de la API y ubicación de la documentación (público)',
  })
  @ApiOkResponse({ type: EstadoApiResponseDto })
  async estado(@Req() request: Request): Promise<EstadoApiResponseDto> {
    const baseDeDatosConectada = await this.appService.baseDeDatosConectada();
    const urlBase = `${request.protocol}://${request.get('host')}`;
    return new EstadoApiResponseDto(baseDeDatosConectada, urlBase);
  }
}
