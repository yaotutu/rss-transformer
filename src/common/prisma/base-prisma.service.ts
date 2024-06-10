import { PrismaClient } from '@prisma/client';
import { WinstonService } from '../logger/winston.service';
import { LogType } from 'src/types';
import { ErrorHandlingService } from '../error-handling/error-handling.service';

/**
 * Base class for Prisma services to handle common functionalities
 * such as error handling and logging.
 */
export abstract class BasePrismaService {
  protected readonly prisma: PrismaClient;

  /**
   * Initializes the Prisma client and injects the WinstonService.
   * @param {WinstonService} winstonService - The Winston logging service.
   */
  constructor(
    protected winstonService: WinstonService,
    protected errorHandlingService: ErrorHandlingService,
  ) {
    // Ensure that PrismaClient is a singleton
    if (!this.prisma) {
      this.prisma = new PrismaClient();
    }
  }

  /**
   * Handles Prisma errors and logs them.
   * @param {LogType} source - The source or type of the log (e.g., DATABASE, TASK).
   * @param {string} message - The error message.
   * @param {any} error - The error object.
   */
  protected handlePrismaError(
    source: LogType,
    message: string,
    error: any,
  ): void {
    this.errorHandlingService.handleError(source, message, error);
  }
}
