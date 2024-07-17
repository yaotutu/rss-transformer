// src/task/tasks/summarize.task.ts
import { Injectable } from '@nestjs/common';
import { convert } from 'html-to-text';
import { SummarizeService } from 'src/common/langchain/summarize.setvice';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import { TaskPrismaService } from 'src/common/prisma/task-prisma.service';
import { SummarizeResult, Task } from 'src/types';
import { ErrorHandlingService } from '../../common/exceptions/error-handling.service';
import { WinstonService } from '../../common/logger/winston.service';
import { TextUtilsService } from '../../common/utils/text-utils.service';

/**
 * Service responsible for handling the SummarizeTask.
 */
@Injectable()
export class SummarizeTask implements Task {
  /**
   * Constructs a new instance of the SummarizeTask.
   * @param rssPrismaService - The RSS Prisma service.
   * @param taskPrismaService - The Task Prisma service.
   * @param textUtilsService - The Text Utils service.
   * @param summarizeService - The Summarize service.
   * @param winstonService - The Winston service.
   */
  constructor(
    private rssPrismaService: RssPrismaService,
    private taskPrismaService: TaskPrismaService,
    private textUtilsService: TextUtilsService,
    private summarizeService: SummarizeService,
    private winstonService: WinstonService,
    private errorHandlingService: ErrorHandlingService,
  ) {}

  /**
   * Executes the SummarizeTask for the specified task ID.
   * @param taskId - The ID of the task to execute.
   * @returns A promise that resolves to the execution result.
   */
  async execute(taskId: number): Promise<any> {
    this.winstonService.info('TASK', `SummarizeTask: executing task ${taskId}`);
    const taskInfo = await this.taskPrismaService.getTaskById(taskId);
    const { rssItemTag, rssSourceUrl } = taskInfo;
    const rssItems = await this.rssPrismaService.getUniqueRssItems(
      taskId,
      rssSourceUrl,
    );
    if (rssItems.length === 0) {
      return;
    }
    try {
      for (const item of rssItems) {
        let tag = '';
        if (rssItemTag && JSON.parse(rssItemTag).length > 0) {
          tag = JSON.parse(rssItemTag)[0];
        } else {
          tag = 'description';
        }
        const rssItemInfo = JSON.parse(item.itemOriginInfo);

        const targetContent =
          typeof rssItemInfo[tag] === 'string'
            ? rssItemInfo[tag]
            : rssItemInfo[tag]?._ ?? '';
        const plainTextContent = convert(targetContent, {
          format: 'plain',
          wordwrap: 120,
          selectors: [
            { selector: 'a', options: { ignoreHref: true } },
            { selector: 'img', format: 'skip' },
          ],
        }).replace(/\s+/g, ' ');
        const finalContent = {} as SummarizeResult;
        const summarizedText =
          await this.summarizeService.summarize(plainTextContent);
        let summarizedTextObj: SummarizeResult | null = null;
        try {
          summarizedTextObj = JSON.parse(summarizedText) as SummarizeResult;
        } catch (error) {
          this.winstonService.error(
            'TASK',
            `SummarizeTask: 处理后的数据不是一个合法的字符串, taskId: ${taskId},尝试更换大模型去解决该问题,summarizedText:${summarizedText}`,
          );
          continue;
        }

        if (
          summarizedTextObj.status &&
          summarizedTextObj.status === 'success'
        ) {
          finalContent.title = rssItemInfo.title;
          finalContent.summary = summarizedTextObj.summary;
          finalContent.key_points = summarizedTextObj.key_points;
          finalContent.tags = summarizedTextObj.tags;
          finalContent.status = 'success';
          finalContent.date = new Date().toISOString();

          this.rssPrismaService.writeRssItemsToTransformed([
            {
              rssItemId: item.id,
              taskId: taskId,
              uniqueArticleId: item.uniqueArticleId,
              itemUrl: item.itemUrl,
              itemTransformedInfo: JSON.stringify(finalContent),
            },
          ]);
          this.winstonService.info(
            'TASK',
            `SummarizeTask: finished task ${taskId}`,
          );
        } else {
        }
      }
    } catch (error) {
      this.errorHandlingService.handleError(
        'SUMMARIZE_TASK',
        'Failed to summarize RSS items',
        error,
        true,
      );
    }
  }
  private parseDateString(dateString) {
    // 解析 RFC 822 日期格式
    const rfc822Pattern =
      /^[a-zA-Z]{3}, \d{2} [a-zA-Z]{3} \d{4} \d{2}:\d{2}:\d{2} [+-]\d{4}$/;
    if (rfc822Pattern.test(dateString)) {
      return new Date(dateString);
    }

    // 解析 ISO 8601 日期格式
    const iso8601Pattern =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
    if (iso8601Pattern.test(dateString)) {
      return new Date(dateString);
    }

    // 如果不匹配任何已知格式，返回 null
    return null;
  }
}
