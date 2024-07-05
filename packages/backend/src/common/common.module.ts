// src/common/common.module.ts
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { ModelConfigService } from './config/model-config.service';
import { ErrorHandlingService } from './exceptions/error-handling.service';
import { HttpClientService } from './http-client/http-client.service';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { LangchainService } from './langchain/langchain.service';
import { ModelFactory } from './langchain/model-factory';
import { WinstonService } from './logger/winston.service';
import { RssPrismaService } from './prisma/rss-prisma.service';
import { TaskPrismaService } from './prisma/task-prisma.service';
import { HtmlSplitterService } from './rss-parser/html-splitter.service';
import { JsonToXmlService } from './rss-parser/json-to-xml.service';
import { RssParserService } from './rss-parser/rss-parser.service';

@Module({
  imports: [HttpModule],
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
    HttpClientService,
    HtmlSplitterService,
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
    HtmlSplitterService,
  ],
})
export class CommonModule {}
