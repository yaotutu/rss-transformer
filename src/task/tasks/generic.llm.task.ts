// src/task/tasks/sayHello.task.ts
import { Injectable } from '@nestjs/common';
import { RssTransformed } from '@prisma/client';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import { TaskPrismaService } from 'src/common/prisma/task-prisma.service';
import { Task } from 'src/types';

@Injectable()
export class GenericLlmTask implements Task {
  constructor(
    private rssPrismaService: RssPrismaService,

    private taskPrismaService: TaskPrismaService,
  ) {}

  async execute(
    data: any,
    rssSourceId: number,
    rssSourceUrl: string,
    taskId: number,
  ): Promise<void> {
    // 这里拿到的是去重过的数据，直接处理就好，不用关心是否重复
    const rssItems = await this.rssPrismaService.getUniqueRssItems(
      taskId,
      rssSourceUrl,
    );

    if (rssItems.length === 0) {
      return;
    }
    const rssTransformedItems = rssItems.map((item) => {
      const { feedType } = item;
      let defaultConetentTag = '';
      if (feedType === 'rss2') {
        defaultConetentTag = 'description';
      } else {
        defaultConetentTag = 'content';
      }

      const rssItemInfo = JSON.parse(item.itemOriginInfo);
      // rssItemInfo.content._ = 'helloworld！';
      item[defaultConetentTag] = this.modifyTagContent(
        rssItemInfo,
        defaultConetentTag,
        'helloworld！',
      );
      return {
        rssItemId: item.id,
        taskId: taskId,
        uniqueArticleId: item.uniqueArticleId,
        itemUrl: item.itemUrl,
        itemTransformedInfo: JSON.stringify(rssItemInfo),
      };
    });
    this.rssPrismaService.writeRssItemsToTransformed(rssTransformedItems);
  }

  /**
   * 修改指定标签的值
   * @param {Object} item - 要修改的item对象
   * @param {string} tagName - 标签名称
   * @param {string} newValue - 新的值
   */
  modifyTagContent(item, tagName, newValue) {
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
  }
}
