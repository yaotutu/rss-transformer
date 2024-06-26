import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PrismaClient,
  RssItem,
  RssSource,
  RssTransformed,
} from '@prisma/client';
import { WinstonService } from '../logger/winston.service';
import { ApiResponse } from '../dto/common.dto';
import { BasePrismaService } from './base-prisma.service';
import { OmitMultiple } from 'src/types';
import { ErrorHandlingService } from '../exceptions/error-handling.service';

/**
 * Service for interacting with Prisma client to manage RSS sources and items.
 */
@Injectable()
export class RssPrismaService extends BasePrismaService {
  constructor(
    prisma: PrismaClient,
    protected winstonService: WinstonService,
    errorHandlingService: ErrorHandlingService,
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
      this.handlePrismaError('RSS source already exists.', null, true);
    }

    // Create a new RSS source
    try {
      const data = { sourceUrl, customName };
      return await this.prisma.rssSource.create({ data });
    } catch (error) {
      this.handlePrismaError('DATABASE', 'Failed to create RSS source.', error);
    }
  }

  /**
   * Retrieves all RSS sources.
   * @returns {Promise<RssSource[] | ApiResponse<string>>} - A list of RSS sources or an ApiResponse with error message.
   */
  async getAllRssSources(): Promise<RssSource[]> {
    try {
      return await this.prisma.rssSource.findMany();
    } catch (error) {
      this.handlePrismaError('Failed to fetch all RSS sources.', error);
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
      this.winstonService.info(
        'DATABASE',
        `RSS source updated successfully for source ID ${id}.`,
      );
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
    items: OmitMultiple<RssItem, 'id' | 'updatedAt' | 'createdAt'>[],
  ): Promise<{ createdCount: number; skippedCount: number }> {
    try {
      const existingItems = await this.prisma.rssItem.findMany({
        where: {
          OR: items.map((item) => ({
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
        `Failed to retrieve RSS items for source with ID ${rssSourceId}.`,
        error,
      );
    }
  }
  /**
   * Retrieves unique RSS items for a given task ID and source URL.
   * @param {number} taskId - The ID of the task.
   * @param {string} sourceUrl - The source URL of the RSS items.
   * @returns {Promise<RssItem[]>} - A list of unique RSS items not present in RssTransformed.
   */
  async getUniqueRssItems(
    taskId: number,
    sourceUrl: string,
  ): Promise<RssItem[]> {
    try {
      // 获取所有与 sourceUrl 相关的 RssItem 数据
      const rssItems = await this.prisma.rssItem.findMany({
        where: {
          rssSource: {
            sourceUrl: sourceUrl,
          },
        },
      });

      // 检查是否找到 RssItem
      if (!rssItems.length) {
        this.winstonService.info(
          'GENERAL',
          'getUniqueRssItems,No RSS items found ',
        );
        return [];
        // throw new NotFoundException(
        //   `No RSS items found for source URL ${sourceUrl}.`,
        // );
      }

      // 获取所有与 taskId 相关的 RssTransformed 数据
      const rssTransformed = await this.prisma.rssTransformed.findMany({
        where: {
          taskId: taskId,
        },
      });

      // 将 RssTransformed 数据的 uniqueArticleId 提取到一个 Set 中
      const transformedIds = new Set(
        rssTransformed.map((item) => item.uniqueArticleId),
      );

      // 过滤出 RssItem 中有但 RssTransformed 中没有的数据
      return rssItems.filter(
        (item) => !transformedIds.has(item.uniqueArticleId),
      );
    } catch (error) {
      this.handlePrismaError(
        '对比 RssItem 和 RssTransformed 数据时出错。',
        error,
      );
      throw error;
    }
  }

  /**
   * Writes multiple RSS items into the RssTransformed table using batch insert.
   * @param {Partial<RssTransformed>[]} data - The array of data to be inserted into RssTransformed table.
   * @returns {Promise<string[]>} - An array of success messages for each item.
   */
  async writeRssItemsToTransformed(
    data: Partial<RssTransformed>[],
  ): Promise<string[]> {
    const successMessages: string[] = [];

    try {
      // Batch insert into RssTransformed table
      await this.prisma.rssTransformed.createMany({
        data: data.map((item) => ({
          rssItemId: item.rssItemId,
          taskId: item.taskId,
          uniqueArticleId: item.uniqueArticleId,
          itemUrl: item.itemUrl,
          itemTransformedInfo: item.itemTransformedInfo,
        })),
      });

      // Create success messages
      data.forEach((item) => {
        const successMessage = `Successfully transformed and inserted RSS item with uniqueArticleId ${item.uniqueArticleId}.`;
        successMessages.push(successMessage);
        this.winstonService.info('DATABASE', successMessage);
      });
    } catch (error) {
      const errorMessage = 'Failed to write RSS items to transformed.';
      this.handlePrismaError('DATABASE', errorMessage, error);

      // Handle error case
      throw new Error(errorMessage);
    }

    return successMessages;
  }
  /**
   * Retrieves all transformed RSS items for a given task ID, and includes the RSS origin info.
   * @param {number} taskId - The ID of the task.
   * @returns {Promise<object>} - A JSON object containing rssOriginInfo and items.
   */
  async getTransformedRssByTaskId(taskId: number): Promise<any> {
    try {
      // 尝试获取 taskId 关联的任务信息
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new NotFoundException(`No Task found for task ID ${taskId}.`);
      }

      const rssSourceId = task.rssSourceId;
      const rssSource = await this.prisma.rssSource.findUnique({
        where: { id: rssSourceId },
      });

      if (!rssSource) {
        throw new NotFoundException(
          `No RssSource found for rssSourceId ${rssSourceId}.`,
        );
      }

      // 获取所有与 taskId 相关的 RssTransformed 数据
      const rssTransformedItems = await this.prisma.rssTransformed.findMany({
        where: { taskId },
      });
      const { feedType } = rssSource;
      // 根据不同的协议类型,返回不同的json字段

      if (feedType === 'atom') {
        const rssJson = JSON.parse(rssSource.rssOriginInfo || '{}').feed;
        rssJson.entry = rssTransformedItems.map((item) => {
          return JSON.parse(item.itemTransformedInfo || '{}');
        });
        return {
          feedType,
          rssJson,
        };
      } else {
        const rssJson = JSON.parse(rssSource.rssOriginInfo || '{}');
        rssJson.rss.channel.item = rssTransformedItems.map((item) => {
          return JSON.parse(item.itemTransformedInfo || '{}');
        });
        return {
          feedType,
          rssJson,
        };
      }
    } catch (error) {
      this.handlePrismaError(
        `Failed to retrieve RssTransformed items with origin info for task ID ${taskId}.`,
        error,
      );
      throw error;
    }
  }

  /**
   * 根据 RSS 源 ID 数组批量删除 RSS 源。
   * @param {number[]} rssSourceIds - RSS 源 ID 的数组。
   * @returns {Promise<RssSource[]>} - 已删除的 RSS 源数组。
   */
  async deleteRssSources(rssSourceIds: Array<number>): Promise<RssSource[]> {
    try {
      // 检查是否存在这些 RSS 源
      const existingRssSources = await this.prisma.rssSource.findMany({
        where: { id: { in: rssSourceIds } },
      });

      if (existingRssSources.length === 0) {
        this.handlePrismaError('DATABASE', '未找到任何 RSS 源。', null);
      }

      // 删除这些 RSS 源
      const deletedRssSources = await this.prisma.rssSource.deleteMany({
        where: { id: { in: rssSourceIds } },
      });

      if (deletedRssSources.count === 0) {
        this.handlePrismaError('DATABASE', '未能删除任何 RSS 源。', null);
      }

      this.winstonService.info(
        'DATABASE',
        `成功删除 RSS 源，源 ID 为：${rssSourceIds.join(', ')}。`,
      );

      // 返回已删除的 RSS 源
      return existingRssSources;
    } catch (error) {
      this.handlePrismaError('DATABASE', '删除 RSS 源失败。', error);
    }
  }
}
