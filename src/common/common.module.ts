// src/common/common.module.ts
import { Module } from '@nestjs/common';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { WinstonService } from './logger/winston.service';
import { RssPrismaService } from './prisma/rss-prisma.service';
import { TaskPrismaService } from './prisma/task-prisma.service';
import { ValidationPipe } from './pipe/validation.pipe';

@Module({
  providers: [
    ResponseInterceptor,
    WinstonService,
    RssPrismaService,
    TaskPrismaService,
  ],
  exports: [
    ResponseInterceptor,
    WinstonService,
    RssPrismaService,
    TaskPrismaService,
  ],
})
export class CommonModule {}
