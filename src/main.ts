import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS')?.split(',') || [],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('IntelliEval API')
    .setDescription('API documentation for IntelliEval - Anonymous evaluation platform for academic institutions')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('departments', 'Department management')
    .addTag('filieres', 'Academic programs (Filieres)')
    .addTag('matieres', 'Courses (Matieres)')
    .addTag('questionnaires', 'Evaluation questionnaires')
    .addTag('campagnes', 'Evaluation campaigns')
    .addTag('reponses', 'Anonymous evaluations')
    .addTag('cours', 'Course materials')
    .addTag('analytics', 'Analytics and dashboards')
    .addTag('exports', 'Data export')
    .addTag('notifications', 'User notifications')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'IntelliEval API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
