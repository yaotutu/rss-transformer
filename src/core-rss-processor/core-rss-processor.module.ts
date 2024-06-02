import { Module } from "@nestjs/common";
import { CoreRssProcessorService } from "./core-rss-processor.service";
import { WinstonService } from "src/common/logger/winston.service";

@Module({
	providers: [CoreRssProcessorService,WinstonService],
	exports: [CoreRssProcessorService],
})
export class CoreRssProcessorModule {}
