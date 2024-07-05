// src/task/tasks/sayHello.task.ts
import { Injectable } from '@nestjs/common';
import { LangchainService } from 'src/common/langchain/langchain.service';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import { TaskPrismaService } from 'src/common/prisma/task-prisma.service';
import { Task } from 'src/types';

@Injectable()
export class GenericLlmTask implements Task {
  constructor(
    private rssPrismaService: RssPrismaService,
    private taskPrismaService: TaskPrismaService,
    private langChainService: LangchainService,
  ) {}

  async execute(
    data: any,
    rssSourceId: number,
    rssSourceUrl: string,
    taskId: number,
  ): Promise<void> {
    // const { taskData, taskType } = data;
    const taskInfo = await this.taskPrismaService.getTaskById(taskId);
    const { taskData, taskType, rssItemTag } = taskInfo;
    let handleTaskExecution: (content: string) => Promise<string>;

    if (taskType === 'TRANSLATE') {
      const { originLang, targetLang } = JSON.parse(taskData);
      handleTaskExecution = (data: string) => {
        return this.langChainService.translateAndSplitParagraph(
          data,
          originLang,
          targetLang,
        );
      };
    }
    // 这里拿到的是去重过的数据，直接处理就好，不用关心是否重复
    const rssItems = await this.rssPrismaService.getUniqueRssItems(
      taskId,
      rssSourceUrl,
    );

    // 如果没有数据，直接返回
    if (rssItems.length === 0) {
      return;
    }
    const rssTransformedItems = await Promise.all(
      rssItems.map(async (item) => {
        const rssItemTagList = JSON.parse(rssItemTag);
        // 原始数据
        let rssItemInfo = JSON.parse(item.itemOriginInfo);
        // 转换后的数据
        let finalRssItemInfo = '';
        await Promise.all(
          rssItemTagList.map(async (tag) => {
            const transedContent = rssItemInfo[tag];
            let finalContent = '';
            if (typeof transedContent === 'string') {
              finalContent = transedContent;
            } else {
              finalContent = transedContent._;
            }
            const processedString = await handleTaskExecution(finalContent);
            finalRssItemInfo = this.modifyTagContent(
              rssItemInfo,
              tag,
              processedString,
            );
          }),
        );
        return {
          rssItemId: item.id,
          taskId: taskId,
          uniqueArticleId: item.uniqueArticleId,
          itemUrl: item.itemUrl,
          itemTransformedInfo: JSON.stringify(finalRssItemInfo),
        };
      }),
    );
    this.rssPrismaService.writeRssItemsToTransformed(rssTransformedItems);
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
