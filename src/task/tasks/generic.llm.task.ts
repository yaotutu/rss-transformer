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
      const rssItemInfo = JSON.parse(item.itemOriginInfo);
      rssItemInfo.content._ = 'helloworld！';
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
}
