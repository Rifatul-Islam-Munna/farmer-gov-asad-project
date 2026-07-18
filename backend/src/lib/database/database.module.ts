import {
  Logger,
  Module,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL'),
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'agrivision'),
        ssl:
          config.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        autoLoadEntities: true,
        synchronize:
          config.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        migrationsRun:
          config.get<string>('DB_MIGRATIONS_RUN', 'false') === 'true',
        migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
        retryAttempts: 5,
        retryDelay: 3000,
        logging: config.get<string>('DB_LOGGING', 'false') === 'true',
        extra: {
          max: config.get<number>('DB_POOL_MAX', 20),
          min: config.get<number>('DB_POOL_MIN', 2),
          connectionTimeoutMillis: config.get<number>(
            'DB_CONNECTION_TIMEOUT_MS',
            10000,
          ),
          idleTimeoutMillis: config.get<number>('DB_IDLE_TIMEOUT_MS', 30000),
        },
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      this.logger.log('PostgreSQL connected successfully');
    }
  }

  async onApplicationShutdown() {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.logger.log('PostgreSQL connection closed');
    }
  }
}
