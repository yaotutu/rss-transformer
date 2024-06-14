// src/common/common.module.ts
import { Module } from '@nestjs/common';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { WinstonService } from './logger/winston.service';
import { RssPrismaService } from './prisma/rss-prisma.service';
import { TaskPrismaService } from './prisma/task-prisma.service';
import { ErrorHandlingService } from './error-handling/error-handling.service';
import { LangchainService } from './langchain/langchain.service';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [
    ResponseInterceptor,
    PrismaClient,
    WinstonService,
    RssPrismaService,
    TaskPrismaService,
    ErrorHandlingService,
    LangchainService,
  ],
  exports: [
    ResponseInterceptor,
    WinstonService,
    PrismaClient,
    RssPrismaService,
    TaskPrismaService,
    ErrorHandlingService,
    LangchainService,
  ],
})
export class CommonModule {}
