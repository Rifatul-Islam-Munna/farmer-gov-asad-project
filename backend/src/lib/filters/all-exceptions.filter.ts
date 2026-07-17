import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();

    const { status, message, error, details } = this.normalize(exception);

    const logMessage = Array.isArray(message) ? message.join(', ') : message;
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}: ${logMessage}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (status !== 404) {
      this.logger.warn(`${request.method} ${request.url}: ${logMessage}`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message,
      details,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      requestId: request.id,
      ...(process.env.NODE_ENV !== 'production' && exception instanceof Error
        ? { stack: exception.stack }
        : {}),
    });
  }

  private normalize(exception: unknown): {
    status: number;
    message: string | string[];
    error: string;
    details?: unknown;
  } {
    if (exception instanceof QueryFailedError) {
      const driverError = exception.driverError as {
        code?: string;
        detail?: string;
      };
      if (driverError.code === '23505') {
        return {
          status: HttpStatus.CONFLICT,
          message: 'A record with the same unique value already exists',
          error: 'Conflict',
          details:
            process.env.NODE_ENV === 'production'
              ? undefined
              : driverError.detail,
        };
      }
      if (driverError.code === '23503') {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'The referenced record does not exist or is still in use',
          error: 'Foreign Key Violation',
        };
      }
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        return { status, message: body, error: exception.name };
      }
      const value = body as Record<string, unknown>;
      return {
        status,
        message:
          (value.message as string | string[] | undefined) ?? exception.message,
        error: (value.error as string | undefined) ?? exception.name,
        details: value.details,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }
}
