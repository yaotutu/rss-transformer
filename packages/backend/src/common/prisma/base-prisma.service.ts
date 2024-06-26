import { PrismaClient } from '@prisma/client';
import { LogType } from 'src/types';
import { WinstonService } from '../logger/winston.service';
import { ErrorHandlingService } from '../exceptions/error-handling.service';

export abstract class BasePrismaService {
  protected readonly prisma: PrismaClient;

  constructor(
    prisma: PrismaClient,
    protected winstonService: WinstonService,
    protected errorHandlingService: ErrorHandlingService,
  ) {
    this.prisma = prisma;
  }

  protected handlePrismaError(
    message: string,
    error: any,
    isUserFacing?: boolean,
  ): void {
    this.errorHandlingService.handleError(
      'DATABASE',
      message,
      error,
      isUserFacing,
    );
  }
}
