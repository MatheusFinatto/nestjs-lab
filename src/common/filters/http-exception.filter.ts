import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type ExceptionResponse = string | { message?: string | string[] };

/**
 * Normalizes a NestJS exception response into a string array.
 */
function normalizeMessage(response: ExceptionResponse): string[] {
  if (typeof response === 'string') return [response];

  if (Array.isArray(response.message)) return response.message;

  if (response.message) return [response.message];

  return [];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const message = normalizeMessage(exception.getResponse());

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
