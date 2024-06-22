import { Injectable } from '@nestjs/common';
import { LogType } from 'src/types';
import { ApiException } from '../dto/common.dto';
import { WinstonService } from '../logger/winston.service';

@Injectable()
export class ErrorHandlingService {
  constructor(private winstonService: WinstonService) {}

  /**
   * Handles errors by logging them and throwing an ApiException.
   * @param {LogType} source - The source or type of the log (e.g., TASK, DATABASE).
   * @param {string} message - The error message.
   * @param {any} error - The error object, which can be null, undefined, a string, or an Error instance.
   */
  handleError(source: LogType, message: string, error: any): void {
    let errorMessage: string;

    if (error instanceof ApiException) {
      // If error is already an ApiException, log and rethrow
      this.winstonService.error(source, message, error);
      throw error;
    } else if (error instanceof Error) {
      // If error is an instance of Error, log its message
      errorMessage = error.message;
      this.winstonService.error(source, message, error);
    } else if (typeof error === 'string') {
      // If error is a string, use it directly
      errorMessage = error;
      this.winstonService.error(source, message, new Error(error));
    } else if (error) {
      // If error is any other truthy value, convert to string and log
      errorMessage = error.toString();
      this.winstonService.error(source, message, new Error(errorMessage));
    } else {
      // If error is null, undefined, or other falsy value, use a default message
      errorMessage = 'Unknown error occurred';
      this.winstonService.error(source, message, new Error(errorMessage));
    }

    // Always throw a new ApiException
    throw new ApiException(500, `${message}: ${errorMessage}`);
  }
}
