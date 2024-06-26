// src/common/common.module.ts
import { Module } from '@nestjs/common';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { WinstonService } from './logger/winston.service';
import { RssPrismaService } from './prisma/rss-prisma.service';
import { TaskPrismaService } from './prisma/task-prisma.service';
import { LangchainService } from './langchain/langchain.service';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { ModelFactory } from './langchain/model-factory';
import { ModelConfigService } from './config/model-config.service';
import { RssParserService } from './rss-parser/rss-parser.service';
import { JsonToXmlService } from './rss-parser/json-to-xml.service';
import { ErrorHandlingService } from './exceptions/error-handling.service';

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
    JsonToXmlService,
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
    JsonToXmlService,
  ],
})
export class CommonModule {}
