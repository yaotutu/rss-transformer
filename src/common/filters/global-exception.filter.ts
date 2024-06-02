// src/common/filters/global-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WinstonService } from '../logger/winston.service';
import { ErrorType } from 'src/types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly winstonService: WinstonService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errorType: ErrorType;
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || 'Internal server error';
      errorType = (exceptionResponse as any).error || 'INTERNAL_SERVER_ERROR';
      details = (exceptionResponse as any).details || null;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      errorType = 'INTERNAL_SERVER_ERROR';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errorType = 'INTERNAL_SERVER_ERROR';
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      errorType,
      details,
    };

    this.winstonService.error(
      errorType,
      `${request.method} ${request.url} - ${JSON.stringify(errorResponse)}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorResponse);
  }
}
