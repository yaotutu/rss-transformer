import {
	Controller,
	Get,
	Post,
	Body,
} from "@nestjs/common";
import { RssService } from "./rss.service";
import { CreateRssDto } from "./dto/create-rss.dto";

@Controller("rss")
export class RssController {
	constructor(private readonly rssService: RssService) {}

	@Post()
	create(@Body() createRssDto: CreateRssDto) {
		return this.rssService.create(createRssDto);
	}

	@Get()
	findAll() {
		return this.rssService.getAllRssSources();
	}
}
