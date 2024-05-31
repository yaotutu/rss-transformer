import { Module } from '@nestjs/common';
import { CoreRssProcessorService } from './core-rss-processor.service';

@Module({
  providers: [CoreRssProcessorService]
})
export class CoreRssProcessorModule {}
