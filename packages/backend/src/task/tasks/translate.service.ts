// src/task/tasks/sayHello.task.ts
import { Injectable } from '@nestjs/common';
import { TranslateService } from 'src/common/langchain/translate.service';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import { TaskPrismaService } from 'src/common/prisma/task-prisma.service';
import { Task } from 'src/types';

@Injectable()
export class TranslateTask implements Task {
  handleTaskExecution: (content: string) => Promise<string>;

  constructor(
    private rssPrismaService: RssPrismaService,
    private taskPrismaService: TaskPrismaService,
    private translateService: TranslateService,
  ) {
    this.handleTaskExecution = (content: string) => {
      return this.translateService.translateAndSplitParagraph(
        content,
        'en',
        'zh',
      );
    };
  }

  /**
   * Executes the translation task for a given task ID.
   * @param taskId - The ID of the task to execute.
   * @returns A Promise that resolves to void.
   */
  async execute(taskId: number): Promise<void> {
    const taskInfo = await this.taskPrismaService.getTaskById(taskId);
    const { taskData, rssItemTag, rssSourceUrl } = taskInfo;

    const { originLang, targetLang } = JSON.parse(taskData);
    this.handleTaskExecution = (data: string) => {
      return this.translateService.translateAndSplitParagraph(
        data,
        originLang,
        targetLang,
      );
    };

    const rssItems = await this.rssPrismaService.getUniqueRssItems(
      taskId,
      rssSourceUrl,
    );

    if (rssItems.length === 0) {
      return;
    }

    for (const item of rssItems) {
      const rssItemTagList = JSON.parse(rssItemTag);
      let rssItemInfo = JSON.parse(item.itemOriginInfo);

      for (const tag of rssItemTagList) {
        const transedContent =
          typeof rssItemInfo[tag] === 'string'
            ? rssItemInfo[tag]
            : rssItemInfo[tag]?._ ?? '';

        const processedString = await this.handleTaskExecution(transedContent);
        rssItemInfo = this.modifyTagContent(rssItemInfo, tag, processedString);
      }

      await this.rssPrismaService.writeRssItemsToTransformed([
        {
          rssItemId: item.id,
          taskId: taskId,
          uniqueArticleId: item.uniqueArticleId,
          itemUrl: item.itemUrl,
          itemTransformedInfo: JSON.stringify(rssItemInfo),
        },
      ]);
    }
  }

  /**
   * 修改指定标签的值
   * @param {Object} itemInfo - 要修改的item对象
   * @param {string} tagName - 标签名称
   * @param {string} newValue - 新的值
   */
  modifyTagContent(
    itemInfo: Record<string, any>,
    tagName: string,
    newValue: string,
  ): Record<string, any> {
    const item = JSON.parse(JSON.stringify(itemInfo));

    if (item[tagName]) {
      if (Array.isArray(item[tagName])) {
        item[tagName] = item[tagName].map((element: any) => {
          if (typeof element === 'object' && element !== null) {
            if ('$' in element) {
              element._ = newValue;
            } else {
              element = newValue;
            }
          } else {
            element = newValue;
          }
          return element;
        });
      } else if (typeof item[tagName] === 'object' && item[tagName] !== null) {
        if ('$' in item[tagName]) {
          item[tagName]._ = newValue;
        } else {
          item[tagName] = newValue;
        }
      } else {
        item[tagName] = newValue;
      }
    }
    return item;
  }
}
