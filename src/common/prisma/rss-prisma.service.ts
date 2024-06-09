import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, RssSource, RssItem } from '@prisma/client';
import { ErrorCode } from 'src/types';
import { WinstonService } from '../logger/winston.service';
import { ApiResponse } from '../dto/common.dto';

/**
 * Service for interacting with Prisma client to manage RSS sources and items.
 */
@Injectable()
export class RssPrismaService {
  private readonly prisma: PrismaClient;

  /**
   * Initializes the Prisma client and injects the WinstonService.
   * @param {WinstonService} winstonService - The Winston logging service.
   */
  constructor(private winstonService: WinstonService) {
    this.prisma = new PrismaClient();
  }

  /**
   * Handles Prisma errors and logs them.
   * @param {any} error - The error object.
   * @param {string} message - The error message.
   */
  private handlePrismaError(error: any, message: string): void {
    this.winstonService.error('DATABASE', message, error); // Log the error using WinstonService
    console.error(message, error);
    throw new InternalServerErrorException(message);
  }

  /**
   * Retrieves an RSS source by its ID.
   * 通过id查询rss源在数据库中的信息
   * @param {number} rssSourceId - The ID of the RSS source.
   * @returns {Promise<RssSource>} - The retrieved RSS source.
   */
  async getRssSourceById(rssSourceId: number): Promise<RssSource> {
    try {
      const rssSource = await this.prisma.rssSource.findUnique({
        where: { id: rssSourceId },
      });

      if (!rssSource) {
        throw new NotFoundException(
          `RSS Source with ID ${rssSourceId} not found.`,
        );
      }

      return rssSource;
    } catch (error) {
      this.handlePrismaError(
        error,
        `Failed to retrieve RSS source with ID ${rssSourceId}.`,
      );
    }
  }

  /**
   * Creates a new RSS source.
   * @param {Object} sourceInfo - The information of the RSS source to be created.
   * @param {string} sourceInfo.sourceUrl - The URL of the RSS source.
   * @param {string} sourceInfo.rssID - The unique ID of the RSS source.
   * @param {string} sourceInfo.customName - The custom name of the RSS source.
   * @returns {Promise<RssSource | ApiResponse<string>>} - A success message or an ApiResponse with error code.
   */
  async createRssSource(sourceInfo: {
    sourceUrl: string;
    rssID: string;
    customName: string;
  }): Promise<RssSource | ApiResponse<string>> {
    const { sourceUrl, rssID, customName } = sourceInfo;

    // Check if the RSS source already exists
    const existingRssSource = await this.prisma.rssSource.findUnique({
      where: { rssID },
    });

    if (existingRssSource) {
      return new ApiResponse(
        409,
        'Conflict',
        null,
        ErrorCode.RSS_SOURCE_EXISTS,
      );
    }

    // Create a new RSS source
    try {
      const data = {
        rssID,
        sourceUrl,
        customName,
      };
      const res = await this.prisma.rssSource.create({
        data,
      });
      return res;
    } catch (error) {
      this.handlePrismaError(error, 'Failed to create RSS source.');
    }
  }

  /**
   * Retrieves all RSS sources.
   * @returns {Promise<RssSource[] | ApiResponse<string>>} - A list of RSS sources or an ApiResponse with error message.
   */
  async getAllRssSources(): Promise<RssSource[] | ApiResponse<string>> {
    try {
      return await this.prisma.rssSource.findMany();
    } catch (error) {
      this.handlePrismaError(error, 'Failed to fetch all RSS sources.');
    }
  }

  /**
   * Updates an RSS source by its ID.
   * @param {number} id - The ID of the RSS source to update.
   * @param {Partial<RssSource>} updateFields - The fields to update in the RSS source.
   * @returns {Promise<RssSource | ApiResponse<string>>} - The updated RSS source or an error response.
   */
  async updateRssSource(
    id: number,
    updateFields: Partial<RssSource>,
  ): Promise<RssSource | ApiResponse<string>> {
    try {
      // Check if the RSS source exists
      const existingRssSource = await this.prisma.rssSource.findUnique({
        where: { id },
      });

      if (!existingRssSource) {
        return new ApiResponse(
          404,
          'Not Found',
          null,
          ErrorCode.RSS_SOURCE_NOT_FOUND,
        );
      }

      // Perform the update
      const updatedRssSource = await this.prisma.rssSource.update({
        where: { id },
        data: updateFields,
      });

      return updatedRssSource;
    } catch (error) {
      this.handlePrismaError(error, 'Failed to update RSS source.');
    }
  }
  /**
   * Creates multiple RSS items in the database.
   * @param {number} rssSourceId - The ID of the RSS source.
   * @param {Omit<RssItem, "id">[]} items - The list of RSS items to create.
   * @returns {Promise<{ createdCount: number, skippedCount: number }>} - Counts of created and skipped items.
   */
  async createRssItems(
    rssSourceId: number,
    items: Omit<RssItem, 'id'>[],
  ): Promise<{ createdCount: number; skippedCount: number }> {
    try {
      const existingItems = await this.prisma.rssItem.findMany({
        where: {
          AND: items.map((item) => ({
            rssSourceId,
            uniqueArticleId: item.uniqueArticleId,
          })),
        },
      });

      const existingIds = new Set(
        existingItems.map((item) => item.uniqueArticleId),
      );

      const newItems = items.filter(
        (item) => !existingIds.has(item.uniqueArticleId),
      );

      let createdCount = 0;
      let skippedCount = 0;

      for (const item of newItems) {
        try {
          await this.prisma.rssItem.create({
            data: item,
          });
          createdCount++;
        } catch (error) {
          // Log the error and continue
          this.winstonService.error(
            'DATABASE',
            `Failed to create RSS item: ${JSON.stringify(item)}`,
            error,
          );
          skippedCount++;
        }
      }

      return {
        createdCount,
        skippedCount,
      };
    } catch (error) {
      this.handlePrismaError(error, 'Failed to create RSS items.');
      throw new Error('Failed to create RSS items.');
    }
  }
}
