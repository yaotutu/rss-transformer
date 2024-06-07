// src/common/exceptions/http-exception.filter.ts

import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();

		const errorResponse = {
			code: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			method: request.method,
			message:
				status !== 404 ? exception.message || null : "Resource not found",
		};

		response.status(status).json(errorResponse);
	}
}
