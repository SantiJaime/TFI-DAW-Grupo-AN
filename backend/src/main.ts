import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { NOMBRE_API, RUTA_DOCUMENTACION, VERSION_API } from './app.constants';

process.env.TZ ??= 'America/Argentina/Buenos_Aires';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  const globalPrefix = 'api';

  app.setGlobalPrefix(globalPrefix, {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle(NOMBRE_API)
    .setDescription('Documentación de la API para el sistema de turnos médicos')
    .setVersion(VERSION_API)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(RUTA_DOCUMENTACION, app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => console.log('Servidor iniciado'))
  .catch((err) => console.error(err));
