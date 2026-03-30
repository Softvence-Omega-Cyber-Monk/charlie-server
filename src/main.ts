// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
  origin: ['http://localhost:5173', 'https://tda-academy.netlify.app'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('TDA Academy API')
    .setDescription('Attendance tracking system for TDA Academy')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'teacher-jwt',
    )
    .addTag('Auth', 'Teacher authentication')
    .addTag('Classes', 'Class management')
    .addTag('Schedules', 'Schedule management')
    .addTag('Students', 'Student management')
    .addTag('Attendance', 'Attendance marking (public)')
    .addTag('Reports', 'Attendance reports')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 TDA Academy API running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
