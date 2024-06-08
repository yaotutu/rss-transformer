import { Module } from "@nestjs/common";
import { TaskController } from "./task.controller";
import { CommonModule } from "src/common/common.module";
import { RssModule } from "src/rss/rss.module";

@Module({
	imports: [CommonModule,RssModule],
	controllers: [TaskController],
})
export class TaskModule {}
