import { Injectable } from '@nestjs/common';
import { LogType } from 'src/types';
import { WinstonService } from '../logger/winston.service';
import { InternalException, UserFacingException } from './custom-exceptions';

/**
 * Handles errors and logs them using the provided `WinstonService`.
 * Throws either a `UserFacingException` or an `InternalException` based on the `isUserFacing` parameter.
 * @param source - The source of the error (e.g., function name, module name).
 * @param message - The error message.
 * @param error - The error object or message.
 * @param isUserFacing - Optional flag indicating whether the error is user-facing.
 * @throws UserFacingException - If `isUserFacing` is `true`, throws a `UserFacingException` with a status code of 400 and the provided message.
 * @throws InternalException - If `isUserFacing` is `false`, throws an `InternalException` with a status code of 500 and the provided message and error details.
 */
@Injectable()
export class ErrorHandlingService {
  constructor(private winstonService: WinstonService) {}

  handleError(
    source: LogType,
    message: string,
    error: any,
    isUserFacing?: boolean,
  ): void {
    let errorMessage: string;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error) {
      errorMessage = error.toString();
    } else {
      errorMessage = 'Unknown error occurred';
    }

    this.winstonService.error(source, message, new Error(errorMessage));

    if (isUserFacing) {
      throw new UserFacingException(400, `${message}`);
    } else {
      throw new InternalException(500, `${message}: ${errorMessage}`);
    }
  }
}
