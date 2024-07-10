// src/task/tasks/summarize.task.ts
import { Injectable } from '@nestjs/common';
import { convert } from 'html-to-text';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import { TaskPrismaService } from 'src/common/prisma/task-prisma.service';
import { Task } from 'src/types';
import { TextUtilsService } from '../../common/utils/text-utils.service';

@Injectable()
export class SummarizeTask implements Task {
  handleTaskExecution: (content: string) => Promise<string>;

  constructor(
    private rssPrismaService: RssPrismaService,
    private taskPrismaService: TaskPrismaService,
    private textUtilsService: TextUtilsService,
  ) {
    this.handleTaskExecution = (content: string) => {
      return Promise.resolve(content);
      // return this.summarizeService.summarize(content);
    };
  }

  async execute(taskId: number): Promise<void> {
    const taskInfo = await this.taskPrismaService.getTaskById(taskId);
    const { rssItemTag, rssSourceUrl } = taskInfo;

    const rssItems = await this.rssPrismaService.getUniqueRssItems(
      taskId,
      rssSourceUrl,
    );

    if (rssItems.length === 0) {
      return;
    }

    for (const item of rssItems) {
      let tag = '';
      if (rssItemTag && JSON.parse(rssItemTag).length > 0) {
        tag = JSON.parse(rssItemTag)[0];
      } else {
        tag = 'description';
      }
      let rssItemInfo = JSON.parse(item.itemOriginInfo);
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
      const processedString = '';
      // rssItemInfo = this.modifyTagContent(rssItemInfo, tag, processedString);
      console.log('Summarize Task Executing', splitText);
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
