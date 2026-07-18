import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ id?: string }>();

    return next.handle().pipe(
      map((payload: unknown) => {
        if (payload === undefined) {
          return {
            success: true,
            requestId: request.id,
            timestamp: new Date().toISOString(),
          };
        }

        if (Array.isArray(payload)) {
          return {
            success: true,
            data: payload,
            requestId: request.id,
            timestamp: new Date().toISOString(),
          };
        }

        if (payload && typeof payload === 'object') {
          const value = payload as Record<string, unknown>;
          if (value.success !== undefined) return value;
          return {
            success: true,
            ...value,
            requestId: request.id,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          data: payload,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
