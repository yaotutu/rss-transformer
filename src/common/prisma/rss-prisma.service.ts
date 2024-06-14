import { Injectable, NotFoundException } from '@nestjs/common';
import { RssSource, RssItem, PrismaClient } from '@prisma/client';
import { WinstonService } from '../logger/winston.service';
import { ApiResponse } from '../dto/common.dto';
import { BasePrismaService } from './base-prisma.service';
import { ErrorHandlingService } from '../error-handling/error-handling.service';

/**
 * Service for interacting with Prisma client to manage RSS sources and items.
 */
@Injectable()
export class RssPrismaService extends BasePrismaService {
  constructor(
    prisma: PrismaClient,
    protected winstonService: WinstonService,
    protected errorHandlingService: ErrorHandlingService,
  ) {
    super(prisma, winstonService, errorHandlingService);
  }

  /**
   * Retrieves an RSS source by its ID.
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
        'DATABASE',
        `Failed to retrieve RSS source with ID ${rssSourceId}.`,
        error,
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
    customName: string;
  }): Promise<RssSource> {
    const { sourceUrl, customName } = sourceInfo;

    // Check if the RSS source already exists
    const existingRssSource = await this.prisma.rssSource.findUnique({
      where: { sourceUrl },
    });

    if (existingRssSource) {
      this.handlePrismaError('DATABASE', 'RSS source already exists.', null);
    }

    // Create a new RSS source
    try {
      const data = { sourceUrl, customName };
      const res = await this.prisma.rssSource.create({ data });
      return res;
    } catch (error) {
      this.handlePrismaError('DATABASE', 'Failed to create RSS source.', error);
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
      this.handlePrismaError(
        'DATABASE',
        'Failed to fetch all RSS sources.',
        error,
      );
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
        this.handlePrismaError('DATABASE', 'RSS source not found.', null);
      }

      // Update the RSS source
      const updatedRssSource = await this.prisma.rssSource.update({
        where: { id },
        data: updateFields,
      });

      return updatedRssSource;
    } catch (error) {
      this.handlePrismaError('DATABASE', 'Failed to update RSS source.', error);
    }
  }

  /**
   * Creates RSS items for a given RSS source.
   * @param {number} rssSourceId - The ID of the RSS source.
   * @param {Omit<RssItem, 'id'>[]} items - The items to create.
   * @returns {Promise<{ createdCount: number; skippedCount: number }>} - The counts of created and skipped items.
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
          await this.prisma.rssItem.create({ data: item });
          createdCount++;
        } catch (error) {
          this.winstonService.error(
            'DATABASE',
            `Failed to create RSS item: ${JSON.stringify(item)}`,
            error,
          );
          skippedCount++;
        }
      }

      return { createdCount, skippedCount };
    } catch (error) {
      this.handlePrismaError('DATABASE', 'Failed to create RSS items.', error);
      throw new Error('Failed to create RSS items.');
    }
  }
  /**
   * Retrieves all RSS items for a given RSS source by its ID.
   * @param {number} rssSourceId - The ID of the RSS source.
   * @returns {Promise<RssItem[]>} - The list of RSS items.
   */
  async getAllItemsByRssSourceId(rssSourceId: number): Promise<RssItem[]> {
    try {
      const rssItems = await this.prisma.rssItem.findMany({
        where: { rssSourceId },
      });

      if (!rssItems.length) {
        throw new NotFoundException(
          `No RSS items found for RSS Source with ID ${rssSourceId}.`,
        );
      }

      return rssItems;
    } catch (error) {
      this.handlePrismaError(
        'DATABASE',
        `Failed to retrieve RSS items for source with ID ${rssSourceId}.`,
        error,
      );
    }
  }
}
