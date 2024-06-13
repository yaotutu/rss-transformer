// src/task/tasks/sayHello.task.ts
import { Injectable } from '@nestjs/common';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import { Task } from 'src/types';

@Injectable()
export class SayHelloTask implements Task {
  constructor(private rssPrismaService: RssPrismaService) {}

  async execute(data: any, rssSourceId: number): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        console.log(`Hello, ${data.param1}!`);
        if (data.param2) {
          console.log(`You have provided param2: ${data.param2}`);
        }

        // 获取所有与 rssSourceId 相关的 RssItem 数据
        const rssItems =
          await this.rssPrismaService.getAllItemsByRssSourceId(rssSourceId);

        // 遍历所有的 RssItem 数据
        // for (const item of rssItems) {
        //   // 在每个数据后面追加 'helloworld'
        //   const updatedContent = (item.itemOriginInfo || '') + 'helloworld';
        // }

        resolve();
      } catch (error) {
        console.error('Error executing SayHelloTask:', error);
        reject(error);
      }
    });
  }
}
