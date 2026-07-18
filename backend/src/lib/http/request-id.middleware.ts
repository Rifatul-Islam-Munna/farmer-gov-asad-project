import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export type RequestWithId = Request & { id: string };

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: RequestWithId, response: Response, next: NextFunction) {
    const incoming = request.header('x-request-id')?.trim();
    request.id = incoming && incoming.length <= 128 ? incoming : randomUUID();
    response.setHeader('x-request-id', request.id);
    next();
  }
}
