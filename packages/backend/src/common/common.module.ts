// src/common/common.module.ts
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { ModelConfigService } from './config/model-config.service';
import { ErrorHandlingService } from './exceptions/error-handling.service';
import { FullContentService } from './full-content/full-content.service';
import { HttpClientService } from './http-client/http-client.service';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { ModelFactory } from './langchain/model-factory';
import { TranslateService } from './langchain/translate.service';
import { WinstonService } from './logger/winston.service';
import { RssPrismaService } from './prisma/rss-prisma.service';
import { TaskPrismaService } from './prisma/task-prisma.service';
import { FeedGeneratorService } from './rss-parser/feed-generator.service';
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
    TranslateService,
    ConfigService,
    ModelFactory,
    ModelConfigService,
    RssParserService,
    JsonToXmlService,
    HttpClientService,
    HtmlSplitterService,
    FullContentService,
    FeedGeneratorService,
  ],
  exports: [
    ResponseInterceptor,
    WinstonService,
    PrismaClient,
    RssPrismaService,
    TaskPrismaService,
    ErrorHandlingService,
    TranslateService,
    ConfigService,
    ModelFactory,
    ModelConfigService,
    RssParserService,
    JsonToXmlService,
    HtmlSplitterService,
    FullContentService,
    FeedGeneratorService,
  ],
})
export class CommonModule {}
