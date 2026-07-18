import {
  Controller,
  Get,
  Header,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { OptionalInfrastructureService } from '../infrastructure/optional-infrastructure.service';
import { MinioService } from '../storage/minio.service';
import { FeatureWorkersService } from '../queue/feature-workers.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly infrastructure: OptionalInfrastructureService,
    private readonly minio: MinioService,
    private readonly workers: FeatureWorkersService,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness check for the NestJS process' })
  live() {
    return {
      status: 'ok',
      service: 'agrivision-backend',
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Prometheus worker metrics' })
  metrics() {
    return this.workers.prometheusMetrics();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness and dependency status' })
  ready() {
    if (!this.dataSource.isInitialized) {
      throw new ServiceUnavailableException('PostgreSQL is not ready');
    }

    const optional = this.infrastructure.status();
    const storage = this.minio.status();
    const degraded =
      (optional.redis.configured && !optional.redis.available) ||
      (optional.qdrant.configured && !optional.qdrant.available) ||
      (storage.configured && !storage.available);

    return {
      status: degraded ? 'degraded' : 'ready',
      dependencies: {
        postgresql: { configured: true, available: true, required: true },
        redis: { ...optional.redis, required: false },
        qdrant: { ...optional.qdrant, required: false },
        storage: { ...storage, required: false },
      },
    };
  }
}
