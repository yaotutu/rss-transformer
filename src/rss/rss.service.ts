import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CreateRssDto } from './dto/create-rss.dto';
import * as Parser from 'rss-parser';
import { createHash } from 'node:crypto';
import { WinstonService } from 'src/common/logger/winston.service';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';

@Injectable()
export class RssService {
  private parser: Parser<any, any>;
  constructor(
    private winstonService: WinstonService,
    private rssPrismaService: RssPrismaService,
  ) {
    this.parser = new Parser({
      headers: { Accept: 'application/rss+xml, text/xml; q=0.1' },
    });
  }

  getAllRssSources() {
    return this.rssPrismaService.getAllRssSources();
  }

  create(_createRssDto: CreateRssDto) {
    const { sourceUrl, id, customName } = _createRssDto;
    try {
      return this.rssPrismaService.createRssSource({
        id: id,
        sourceUrl: sourceUrl,
        customName: customName,
      });
    } catch (error) {
      this.winstonService.error('ADD_RSS_SOURCE', '添加RSS源时出错', error);
      throw new ServiceUnavailableException(
        'RSS feed is currently unavailable. Please try again later.',
      );
    }
  }

  /**
   * Generates a unique article ID based on the URL and content of an article.
   * @param {string} url - The URL of the article.
   * @param {string} content - The content of the article.
   * @returns {string} - A unique hash ID.
   */
  generateUniqueArticleId(url: string, content: string): string {
    const hash = createHash('sha256');
    hash.update(url + content);
    return hash.digest('hex');
  }

  // async updateItemByRssSourceID(id: number) {
  //    const rssSource = await this.rssPrismaService.getRssSourceById(id);
  //
  //    const feed = await this.fetchRssData(rssSource.sourceUrl);
  //    const items = feed.items;
  // 	return `${JSON.stringify(feed)} 任务进行中`;
  // }
  /**
   * Updates RSS items by RSS source ID.
   * @param {number} id - The ID of the RSS source.
   * @returns {Promise<string>} - A message indicating the update status.
   */
  async updateItemByRssSourceID(id: number): Promise<string> {
    try {
      const rssSource = await this.rssPrismaService.getRssSourceById(id);

      const feed = await this.fetchRssData(rssSource.sourceUrl);
      const items = feed.items.map((item) => ({
        rssSourceId: id,
        itemUrl: item.link,
        itemOriginInfo: JSON.stringify(item), // Assuming itemOriginInfo is a JSON string
        uniqueArticleId: this.generateUniqueArticleId(
          item.link,
          item.content || item.description || '',
        ),
      }));

      const { createdCount, skippedCount } =
        await this.rssPrismaService.createRssItems(id, items);

      this.winstonService.info(
        'UPDATE_RSS_ITEMS',
        `Stored ${createdCount} new RSS items.`,
      );
      if (skippedCount > 0) {
        this.winstonService.info(
          'UPDATE_RSS_ITEMS',
          `Skipped ${skippedCount} existing RSS items.`,
        );
      }

      return `RSS items updated successfully for source ID ${id}.`;
    } catch (error) {
      // Log the error and throw a new exception
      this.winstonService.error(
        'UPDATE_RSS_ITEMS',
        'Failed to update RSS items',
        error,
      );
    }
  }

  async fetchRssData(url: string) {
    try {
      const feed = await this.parser.parseURL(url);
      return feed;
    } catch (error) {
      this.winstonService.error(
        'RSS_PARSER',
        'The Rss parser has an  error',
        error,
      );
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'RSS_PARSER_ERROR',
          message: 'There was an error parsing the RSS feed.',
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
