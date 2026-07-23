import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

async function bootstrap() {
  // Start MongoMemoryServer in memory
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  console.log(`[Database] In-memory MongoDB running at: ${mongoUri}`);
  process.env.MONGO_URI = mongoUri;

  const app = await NestFactory.create(AppModule);

  // Enable CORS for mobile connectivity
  app.enableCors();

  // Enable validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configure Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('GymVault API')
    .setDescription('Backend REST API for GymVault fitness tracking application')
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`[Server] GymVault Server running on: http://localhost:3000`);
  console.log(`[Swagger] Swagger UI available at: http://localhost:3000/api`);
}
bootstrap();
