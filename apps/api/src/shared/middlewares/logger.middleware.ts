import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const SENSITIVE_FIELDS = ['password', 'passwordHash', 'token', 'secret', 'authorization'];

function maskSensitiveFields(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return obj;
  const masked = { ...obj };
  for (const key of Object.keys(masked)) {
    if (SENSITIVE_FIELDS.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      masked[key] = '***';
    }
  }
  return masked;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    const param = `\n param: ${JSON.stringify(req.params)}`;
    const query = `\n query: ${JSON.stringify(req.query)}`;
    const body =
      req.method === 'POST' || req.method === 'PUT'
        ? `\n body: ${JSON.stringify(maskSensitiveFields(req.body as Record<string, unknown>))}`
        : '';

    this.logger.log(`[${req.method} - ${req.baseUrl}]: ${param} ${query} ${body}`);
    next();
  }
}
