import {
	HttpException,
	HttpStatus,
	Injectable,
	ServiceUnavailableException,
} from "@nestjs/common";
import { CreateRssDto } from "./dto/create-rss.dto";
import { UpdateRssDto } from "./dto/update-rss.dto";
import * as Parser from "rss-parser";
import { WinstonService } from "src/common/logger/winston.service";
import { RssPrismaService } from "src/common/prisma/rss-prisma.service";

@Injectable()
export class RssService {
	private parser: Parser<any, any>;
	constructor(
		private winstonService: WinstonService,
		private rssPrismaService: RssPrismaService,
	) {
		this.parser = new Parser({
			headers: { Accept: "application/rss+xml, text/xml; q=0.1" },
		});
	}

	getAllRssSources() {
		return this.rssPrismaService.getAllRssSources();
	}

	create(_createRssDto: CreateRssDto) {
		const { sourceUrl, rssID, customName } = _createRssDto;
		try {
			return this.rssPrismaService.createRssSource({
				rssID: rssID,
				sourceUrl: sourceUrl,
				customName: customName,
			});
		} catch (error) {
			this.winstonService.error("ADD_RSS_SOURCE", "添加RSS源时出错", error);
			throw new ServiceUnavailableException(
				"RSS feed is currently unavailable. Please try again later.",
			);
		}
	}

	generateItemByRssSourceID(id: number) {
		return `${id} 任务进行中`;
	}

	update(id: number, _updateRssDto: UpdateRssDto) {
		return `This action updates a #${id} rss`;
	}

	remove(id: number) {
		return `This action removes a #${id} rss`;
	}

	async initializeRssSources(url) {
		const feed = await this.parser.parseURL(url);
		const {} = feed;
		feed.items = undefined;
		const rssOriginInfo = JSON.stringify(feed);
		this.rssPrismaService.updateRssSource(2, { rssOriginInfo });
	}

	async fetchRssData(url: string) {
		try {
			const feed = await this.parser.parseURL(url);
			return feed;
		} catch (error) {
			this.winstonService.error(
				"RSS_PARSER",
				"The Rss parser has an  error",
				error,
			);
			throw new HttpException(
				{
					status: HttpStatus.BAD_REQUEST,
					error: "RSS_PARSER_ERROR",
					message: "There was an error parsing the RSS feed.",
					details: error.message, // Include the actual error message in details
				},
				HttpStatus.BAD_REQUEST,
			);
		}

		// const res = await this.prisma.rssSource.create({
		// 	data: {
		// 		sourceUrl: feed.link,
		// 		sourceTitle: feed.title,
		// 	},
		// });

		// const res = await this.prisma.rssSource.findUnique({
		// 	where: {
		// 		sourceUrl: "https://www.williamlong.info/1",
		// 	},
		// });
		//    if (!rssSource) {
		//   throw new Error(`RssSource with id ${articleData.rssSourceId} does not exist`);
		// }
		// const res = await this.prisma.article.create({
		// 	data: {
		// 		articleUrl: "https://www.williamlong.info/archives/7430.html",
		// 		articleId: "123456",
		// 		articleGuid: "unique-guid-123",
		// 		title: "Example Article",
		// 		content: "This is the content of the example article.",
		// 		// rssSource: "https://www.williamlong.info/",
		// 		rssSource: {
		// 			connect: {
		// 				sourceUrl: "https://www.williamlong.info/",
		// 			},
		// 		},
		// 	},
		// });
		// console.log(res);
	}
}
