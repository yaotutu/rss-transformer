import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from '../dto/common.dto';
import { ValidationError } from 'class-validator';

@Catch(HttpException) // 捕获所有 HttpException 类型的异常
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 获取异常的状态码，如果异常没有 getStatus 方法，默认为 500
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // 初始化异常消息
    let message: any = exception.message || 'Bad Request Exception';
    let errorResponse: any;

    // 处理自定义的 ApiException 类型的异常
    if (exception instanceof ApiException) {
      message = exception.message;
      errorResponse = {
        statusCode: status,
        message: message,
      };
    }
    // 处理 BadRequestException 类型的异常（通常由 class-validator 抛出）
    else if (exception instanceof BadRequestException) {
      const response = exception.getResponse() as any;

      // 检查并格式化验证错误信息
      if (
        response.message &&
        Array.isArray(response.message) &&
        response.message[0] instanceof ValidationError
      ) {
        message = this.formatValidationErrors(response.message);
      } else {
        message = response.message || 'Bad Request';
      }
      errorResponse = {
        statusCode: status,
        message: message,
        error: exception.name || '',
      };
    }
    // 处理其他类型的 HttpException
    else {
      errorResponse = {
        statusCode: status,
        message: message,
        error: exception.name || '',
      };
    }

    // 返回自定义的错误响应
    response.status(status).json(errorResponse);
  }

  /**
   * 格式化验证错误信息
   * @param errors - 验证错误数组
   * @returns 格式化后的错误信息数组
   */
  private formatValidationErrors(errors: ValidationError[]): string[] {
    return errors.map((err) => {
      // 将每个验证错误的约束信息合并成一个字符串
      return Object.values(err.constraints || {}).join(', ');
    });
  }
}
