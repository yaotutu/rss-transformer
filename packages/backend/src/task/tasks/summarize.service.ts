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
        const splitText =
          this.textUtilsService.splitTextByLanguage(plainTextContent);
        this.winstonService.info('TASK', `Split text: ${splitText}`);
        const finalContent = {} as SummarizeResult;
        let isSuccess = true;
        for (const text of splitText) {
          const summarizedText = await this.summarizeService.summarize(text);
          const summarizedTextObj = JSON.parse(
            summarizedText,
          ) as SummarizeResult;
          if (summarizedTextObj.status === 'success') {
            finalContent.title = rssItemInfo.title;
            finalContent.summary = summarizedTextObj.summary;
            finalContent.key_points = summarizedTextObj.key_points;
            finalContent.tags = summarizedTextObj.tags;
            finalContent.status = 'success';
          } else {
            isSuccess = false;
            break;
          }
        }
        if (!isSuccess) {
          continue; // Skip writing the RSS item if there was an error
        }
        this.rssPrismaService.writeRssItemsToTransformed([
          {
            rssItemId: item.id,
            taskId: taskId,
            uniqueArticleId: item.uniqueArticleId,
            itemUrl: item.itemUrl,
            itemTransformedInfo: JSON.stringify(finalContent),
          },
        ]);
      }
    } catch (error) {
      this.errorHandlingService.handleError(
        'SUMMARIZE_TASK',
        'Failed to summarize RSS items',
        error,
        true,
      );
    }

    this.winstonService.info('TASK', `SummarizeTask: finished task ${taskId}`);
  }
}
