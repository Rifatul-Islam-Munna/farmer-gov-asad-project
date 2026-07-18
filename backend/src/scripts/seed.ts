import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function seed() {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    // Current idempotent seeds run from module lifecycle hooks:
    // - admin account from ADMIN_EMAIL/ADMIN_PASSWORD
    // - goods categories and starter goods
    // - market-price demo rows
    // - medicine catalog starter rows
    logger.log('Idempotent seed hooks completed successfully');
  } finally {
    await app.close();
  }
}

void seed();
