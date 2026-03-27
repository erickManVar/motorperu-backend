import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: process.env.NODE_ENV !== 'production' }),
  );

  await app.register(require('@fastify/helmet'));
  await app.register(require('@fastify/compress'));

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.BACKOFFICE_URL || 'http://localhost:3001',
    ],
    credentials: true,
  });

  // ZodValidationPipe used per-endpoint with schema injection
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 4000;
  await app.listen(Number(port), '0.0.0.0');
  console.log(`MotorPeru API running on port ${port}`);
}
bootstrap();
