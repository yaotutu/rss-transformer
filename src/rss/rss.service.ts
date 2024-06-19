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
import { RssParserService } from 'src/common/rss-parser/rss-parser.service';

@Injectable()
export class RssService {
  private parser: Parser<any, any>;
  constructor(
    private winstonService: WinstonService,
    private rssPrismaService: RssPrismaService,
    private rssParserService: RssParserService,
  ) {
    this.parser = new Parser({
      headers: { Accept: 'application/rss+xml, text/xml; q=0.1' },
      xml2js: {
        explicitArray: false, // Ensure that repeated elements are not overwritten
      },
    });
  }

  getAllRssSources() {
    return this.rssPrismaService.getAllRssSources();
  }

  async create(_createRssDto: CreateRssDto) {
    const { sourceUrl, customName } = _createRssDto;
    try {
      const rssSourceItem = await this.rssPrismaService.createRssSource({
        sourceUrl: sourceUrl,
        customName: customName,
      });
      return await this.updateItemByRssSourceID(rssSourceItem.id);
    } catch (error) {
      this.winstonService.error('ADD_RSS_SOURCE', '添加RSS源时出错', error);
      throw new ServiceUnavailableException(error.message);
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

  /**
   * Updates RSS items by RSS source ID.
   * @param {number} id - The ID of the RSS source.
   * @returns {Promise<string>} - A message indicating the update status.
   */
  async updateItemByRssSourceID(id: number): Promise<string> {
    try {
      const rssSource = await this.rssPrismaService.getRssSourceById(id);
      const parsedUrl = await this.rssParserService.parseUrl(
        rssSource.sourceUrl,
      );
      const { feedInfo, items, feedType, xmlDeclaration } = parsedUrl;

      this.rssPrismaService.updateRssSource(id, {
        rssOriginInfo: JSON.stringify(feedInfo),
        feedType,
      });
      let organizedItem = [];
      if (feedType === 'atom') {
        organizedItem = items.map((item) => ({
          rssSourceId: id,
          itemUrl: item.link.$.href,
          itemOriginInfo: JSON.stringify(item), // Assuming itemOriginInfo is a JSON string
          uniqueArticleId: this.generateUniqueArticleId(
            item.link.$.href,
            item.content._,
          ),
        }));
      } else {
        organizedItem = items.map((item) => ({
          rssSourceId: id,
          itemUrl: item.link,
          itemOriginInfo: JSON.stringify(item), // Assuming itemOriginInfo is a JSON string
          uniqueArticleId: this.generateUniqueArticleId(
            item.link,
            item.description,
          ),
          feedType,
        }));
      }

      const { createdCount, skippedCount } =
        await this.rssPrismaService.createRssItems(id, organizedItem);

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

  async test() {
    return await this.updateItemByRssSourceID(7);
  }
}
