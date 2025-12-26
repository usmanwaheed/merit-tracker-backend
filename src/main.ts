// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Split the FRONTEND_URL string into an array
  const frontendUrls = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: frontendUrls,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Merit Tracker API')
    .setDescription('Complete backend API for Merit Tracking Application')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('companies', 'Company management')
    .addTag('departments', 'Department management')
    .addTag('projects', 'Project management')
    .addTag('sub-projects', 'Task/Sub-project management')
    .addTag('time-tracking', 'Time tracking with cross-device sync')
    .addTag('sops', 'Standard Operating Procedures')
    .addTag('chat', 'Project chat rooms')
    .addTag('notifications', 'User notifications')
    .addTag('activity-logs', 'Activity audit logs')
    .addTag('superadmin-auth', 'Superadmin authentication')
    .addTag('superadmin-companies', 'Superadmin company management')
    .addTag('superadmin-plans', 'Superadmin plan management')
    .addTag('superadmin-users', 'Superadmin user management')
    .addTag('superadmin-subscriptions', 'Superadmin subscription management')
    .addTag('superadmin-transactions', 'Superadmin transaction management')
    .addTag('superadmin-analytics', 'Superadmin analytics')
    .addTag('superadmin-settings', 'Superadmin platform settings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(
    `📚 Swagger docs available at: http://localhost:${port}/api/docs`,
  );
  console.log(`🌐 Allowed frontend origins: ${frontendUrls.join(', ')}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
