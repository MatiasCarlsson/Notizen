import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global
  app.setGlobalPrefix('api');

  // CORS
  const raw = (process.env.FRONTEND_URL ?? '*').replace(/['"]/g, '').trim();
  const allowedOrigins = raw
    .split(',')
    .map((o) => o.trim())
    .filter((o) => /^https?:\/\//.test(o) || o === '*');

  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : '*',
    credentials: true,
  });

  // 1. Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // 2. Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina campos no declarados en el DTO
      forbidNonWhitelisted: true, // lanza error si llegan campos extra
      transform: true, // transforma los tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Notes API')
    .setDescription('API para gestión de notas y categorías')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ? parseInt(process.env.PORT) : 3000);
}

bootstrap();
