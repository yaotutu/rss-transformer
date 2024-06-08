import { Body, Controller, Post } from "@nestjs/common";
import { CreateItemDto } from "./dto/create-item.dto";
import { RssService } from "src/rss/rss.service";

@Controller("task")
export class TaskController {
	constructor(private readonly rssService: RssService) {}
	@Post()
	create(@Body() createItemDto: CreateItemDto) {
		const { rssSourceID, taskType } = createItemDto;
		switch (taskType) {
			case "UPDATE_ITEM":
				return this.rssService.updateItemByRssSourceID(rssSourceID);
			default:
				return "暂不支持的任务类型";
		}
	}
}
