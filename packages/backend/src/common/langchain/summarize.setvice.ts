import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Injectable } from '@nestjs/common';
import { HtmlSplitterService } from '../rss-parser/html-splitter.service';
import { ModelFactory } from './model-factory';

@Injectable()
export class SummarizeService {
  private model;

  constructor(
    private modelFactory: ModelFactory,
    private htmlSplitterService: HtmlSplitterService, // 注入 HtmlSplitterService
  ) {}

  async summarize(
    content: string,
    lang: string = '中文',
    summary_length: number = 100,
  ) {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `
        1.你的角色是阅读助手，专门总结文章。用户会发送文章内容，你的任务是用一句话或两句话总结文章，提供简洁、明确的主要点总结。需要你理解内容，提取关键信息和标签，并以简体中文输出。
        2.输出内容格式为JSON，包含以下字段：
            * “title”: 文章标题
            * “summary”: 一句话总结
            * “key_points”: 关键信息点列表，每个点是一个字符串
            * “tags”: 标签列表，每个标签是一个字符串
            * “status”: 当前任务状态。如果执行成功，返回”success”；如果发生异常，返回”error”并标注原因。
        3.只输出上述字段。
          总结内容应如下格式：{"title": "文章标题","summary": "文章总结","key_points": ["关键信息1", "关键信息2", "关键信息3"],"tags": ["标签1", "标签2", "标签3"],"status": "success" // 或者 "error: 原因"}
          `,
      ],
      ['user', '{input}'],
    ]);
    const parser = new StringOutputParser();
    try {
      const chain = prompt.pipe(this.model).pipe(parser);
      const result = await chain.invoke({ input: content });
      return result.trim(); // 返回翻译后的单段结果
    } catch (error) {
      console.error('Error translating single paragraph:', error);
      throw error;
    }
    return Promise.resolve('summarized content');
  }
}
