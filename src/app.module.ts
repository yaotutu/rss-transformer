import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RssModule } from './rss/rss.module';
import { CoreRssProcessorModule } from './core-rss-processor/core-rss-processor.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { CommonModule } from './common/common.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TaskModule } from './task/task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskService } from './task/task.service';
import { ValidationPipe } from './common/pipe/validation.pipe';

@Module({
  imports: [
    RssModule,
    CoreRssProcessorModule,
    CommonModule,
    TaskModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TaskService,
    // {
    //   provide: APP_PIPE,
    //   useClass: ValidationPipe,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
