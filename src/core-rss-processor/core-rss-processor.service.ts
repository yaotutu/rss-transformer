import { Injectable } from "@nestjs/common";
import * as Parser from "rss-parser";
import { PrismaClient } from "@prisma/client";
import { WinstonService } from "src/common/logger/winston.service";

@Injectable()
export class CoreRssProcessorService {
	private parser: Parser<any, any>;
	private prisma: PrismaClient;
	constructor(private winstonService: WinstonService){
		this.parser = new Parser({
			// headers: { Accept: "application/rss+xml, text/xml; q=0.1" },
		});
		this.prisma = new PrismaClient();
	}
	async fetchRssData(url: string) {
		try {
			const feed = await this.parser.parseURL(url);
			return feed;
		} catch (error) {
			// this.winstonService.error(
			// 	"RSS_PARSER",
			// 	"The Rss parser has an  error",
			// 	error.stack,
			// );
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
