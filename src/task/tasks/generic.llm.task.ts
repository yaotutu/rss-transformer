// src/task/tasks/sayHello.task.ts
import { Injectable } from '@nestjs/common';
import { RssTransformed } from '@prisma/client';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import { Task } from 'src/types';

@Injectable()
export class GenericLlmTask implements Task {
  constructor(private rssPrismaService: RssPrismaService) {}

  async execute(
    data: any,
    rssSourceId: number,
    rssSourceUrl: string,
    taskId: number,
  ): Promise<void> {
    const rssItems = await this.rssPrismaService.getUniqueRssItems(
      taskId,
      rssSourceUrl,
    );
    const rssTransformedItems = rssItems.map((item) => {
      const rssItemInfo = JSON.parse(item.itemOriginInfo);
      rssItemInfo.content = 'helloworld';
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
