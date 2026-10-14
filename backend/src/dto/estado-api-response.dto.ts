import { ApiProperty } from '@nestjs/swagger';
import { NOMBRE_API, RUTA_DOCUMENTACION, VERSION_API } from '../app.constants';

export class EstadoApiResponseDto {
  @ApiProperty({ example: 'API Clínica Médica - TFI DAW' })
  nombre: string;

  @ApiProperty({ example: '1.0' })
  version: string;

  @ApiProperty({ enum: ['OK', 'ERROR'], example: 'OK' })
  estado: 'OK' | 'ERROR';

  @ApiProperty({ enum: ['CONECTADA', 'DESCONECTADA'], example: 'CONECTADA' })
  base_de_datos: 'CONECTADA' | 'DESCONECTADA';

  @ApiProperty({ example: 'http://localhost:3000/docs' })
  documentacion: string;

  @ApiProperty({ example: 'http://localhost:3000/docs-json' })
  documentacion_json: string;

  @ApiProperty({ example: '2026-10-14T15:00:00.000Z' })
  fecha_hora: Date;

  constructor(baseDeDatosConectada: boolean, urlBase: string) {
    this.nombre = NOMBRE_API;
    this.version = VERSION_API;
    this.estado = baseDeDatosConectada ? 'OK' : 'ERROR';
    this.base_de_datos = baseDeDatosConectada ? 'CONECTADA' : 'DESCONECTADA';
    this.documentacion = `${urlBase}/${RUTA_DOCUMENTACION}`;
    this.documentacion_json = `${urlBase}/${RUTA_DOCUMENTACION}-json`;
    this.fecha_hora = new Date();
  }
}
