// src/task/tasks/sayHello.task.ts
import { Injectable } from '@nestjs/common';
import { LangchainService } from 'src/common/langchain/langchain.service';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import { TaskPrismaService } from 'src/common/prisma/task-prisma.service';
import { Task } from 'src/types';

@Injectable()
export class TranslateTask implements Task {
  constructor(
    private rssPrismaService: RssPrismaService,
    private taskPrismaService: TaskPrismaService,
    private langChainService: LangchainService,
  ) {}

  async execute(taskId: number): Promise<void> {
    const taskInfo = await this.taskPrismaService.getTaskById(taskId);
    const { taskData, rssItemTag, rssSourceUrl } = taskInfo;
    let handleTaskExecution: (content: string) => Promise<string>;

    const { originLang, targetLang } = JSON.parse(taskData);
    handleTaskExecution = (data: string) => {
      return this.langChainService.translateAndSplitParagraph(
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
      let finalRssItemInfo = rssItemInfo;

      for (const tag of rssItemTagList) {
        const transedContent = rssItemInfo[tag];
        let finalContent = '';
        if (typeof transedContent === 'string') {
          finalContent = transedContent;
        } else {
          finalContent = transedContent._;
        }
        const processedString = await handleTaskExecution(finalContent);
        finalRssItemInfo = this.modifyTagContent(
          finalRssItemInfo,
          tag,
          processedString,
        );
      }

      const rssTransformedItem = {
        rssItemId: item.id,
        taskId: taskId,
        uniqueArticleId: item.uniqueArticleId,
        itemUrl: item.itemUrl,
        itemTransformedInfo: JSON.stringify(finalRssItemInfo),
      };

      await this.rssPrismaService.writeRssItemsToTransformed([
        rssTransformedItem,
      ]);
    }
  }
  /**
   * 修改指定标签的值
   * @param {Object} item - 要修改的item对象
   * @param {string} tagName - 标签名称
   * @param {string} newValue - 新的值
   */
  modifyTagContent(itemInfo, tagName, newValue) {
    const item = JSON.parse(JSON.stringify(itemInfo));
    if (item[tagName]) {
      const content = item[tagName];
      if (Array.isArray(content)) {
        content.forEach((element, index) => {
          if (typeof element === 'object' && element !== null) {
            if ('$' in element) {
              element._ = newValue; // 如果有 $, 修改 _
            } else {
              item[tagName][index] = newValue; // 如果没有 $, 直接修改
            }
          } else {
            item[tagName][index] = newValue;
          }
        });
      } else if (typeof content === 'object' && content !== null) {
        if ('$' in content) {
          content._ = newValue; // 如果有 $, 修改 _
        } else {
          item[tagName] = newValue; // 如果没有 $, 直接修改
        }
      } else {
        item[tagName] = newValue;
      }
    }
    return item;
  }
}
