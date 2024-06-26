import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { WinstonService } from 'src/common/logger/winston.service';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import { RssParserService } from 'src/common/rss-parser/rss-parser.service';
import { CreateRssDto } from './dto/create-rss.dto';
import { RssSource } from '@prisma/client';

@Injectable()
export class RssService {
  constructor(
    private winstonService: WinstonService,
    private rssPrismaService: RssPrismaService,
    private rssParserService: RssParserService,
  ) {}

  /**
   * Retrieves all RSS sources.
   * @returns {Promise<RssSource[]>} - A promise that resolves to an array of RSS sources.
   */
  getAllRssSources(): Promise<RssSource[]> {
    return this.rssPrismaService.getAllRssSources();
  }

  /**
   * Creates a new RSS source.
   * @param {CreateRssDto} _createRssDto - The DTO containing the source URL and custom name.
   * @returns {Promise<string>} - A message indicating the creation status.
   * @throws {ServiceUnavailableException} - If an error occurs while creating the RSS source.
   */
  async create(_createRssDto: CreateRssDto): Promise<string> {
    const { sourceUrl, customName } = _createRssDto;
    const rssSourceItem = await this.rssPrismaService.createRssSource({
      sourceUrl: sourceUrl,
      customName: customName,
    });
    return this.updateItemByRssSourceID(rssSourceItem.id);
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
        organizedItem = items.map((item) => {
          let linkHref = '';

          // 如果 item.link 是数组，找到第一个具有 href 属性的对象
          if (Array.isArray(item.link)) {
            const linkWithHref = item.link.find(
              (link) => link && link.$ && link.$.href,
            );
            linkHref = linkWithHref ? linkWithHref.$.href : '';
          } else if (item.link && item.link.$ && item.link.$.href) {
            // 否则直接取 item.link.$.href
            linkHref = item.link.$.href;
          }
          return {
            rssSourceId: id,
            itemUrl: linkHref,
            itemOriginInfo: JSON.stringify(item), // Assuming itemOriginInfo is a JSON string
            uniqueArticleId: this.generateUniqueArticleId(
              linkHref,
              item.content ? item.content._ : '',
            ),
          };
        });
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
