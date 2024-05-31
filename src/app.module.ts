import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RssModule } from './rss/rss.module';
import { CoreRssProcessorModule } from './core-rss-processor/core-rss-processor.module';

@Module({
  imports: [RssModule, CoreRssProcessorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
