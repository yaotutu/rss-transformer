import { Module } from "@nestjs/common";
import { RssService } from "./rss.service";
import { RssController } from "./rss.controller";
import { CommonModule } from "src/common/common.module";


@Module({
	imports: [CommonModule],
	controllers: [RssController],
	providers: [RssService],
})
export class RssModule {}
