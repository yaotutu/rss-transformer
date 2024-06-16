// src/common/common.module.ts
import { Module } from '@nestjs/common';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { WinstonService } from './logger/winston.service';
import { RssPrismaService } from './prisma/rss-prisma.service';
import { TaskPrismaService } from './prisma/task-prisma.service';
import { ErrorHandlingService } from './error-handling/error-handling.service';
import { LangchainService } from './langchain/langchain.service';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { ModelFactory } from './langchain/model-factory';
import { ModelConfigService } from './config/model-config.service';
import { RssParserService } from './rss-parser/rss-parser.service';

@Module({
  providers: [
    ResponseInterceptor,
    PrismaClient,
    WinstonService,
    RssPrismaService,
    TaskPrismaService,
    ErrorHandlingService,
    LangchainService,
    ConfigService,
    ModelFactory,
    ModelConfigService,
    RssParserService,
  ],
  exports: [
    ResponseInterceptor,
    WinstonService,
    PrismaClient,
    RssPrismaService,
    TaskPrismaService,
    ErrorHandlingService,
    LangchainService,
    ConfigService,
    ModelFactory,
    ModelConfigService,
    RssParserService,
  ],
})
export class CommonModule {}
