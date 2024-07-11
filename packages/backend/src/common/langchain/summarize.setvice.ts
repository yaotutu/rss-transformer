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
    lang: string = '简体中文',
    summary_length: number = 100,
  ): Promise<string> {
    const jsonFormat = `{
      "title": "文章标题",
      "summary": "文章总结",
      "key_points": ["关键信息1", "关键信息2", "关键信息3"],
      "tags": ["标签1", "标签2", "标签3"],
      "status": "success" // 或者 "error: 原因"
    }`;
    this.model = this.modelFactory.getModel('Ollama');
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `
        1. 你的角色是阅读助手，专门总结文章。用户会发送文章内容，你的任务是用一句话或两句话总结文章，提供简洁、明确的主要点总结。需要你理解内容，提取关键信息和标签，并以${lang}输出。
        2. 输出内容格式为 JSON 的字符串：
          - "title": 文章标题
          - "summary": 一句话总结
          - "key_points": 关键信息点列表，每个点是一个字符串
          - "tags": 标签列表，每个标签是一个字符串
          - "status": 当前任务状态。如果执行成功，返回 "success"；如果发生异常，返回 "error" 并标注原因。
        3. 只输出上述字段。
        4. 总结内容应如下格式（所有内容在一行）,输出的内容不应该包含任何换行符("\n"):
          {{"title": "文章标题","summary": "文章总结","key_points": ["关键信息1", "关键信息2", "关键信息3"],"tags": ["标签1", "标签2", "标签3"],"status": "success" // 或者 "error: 原因"}}
        `,
      ],
      ['user', '{input}'],
    ]);
    const parser = new StringOutputParser();
    try {
      const chain = prompt.pipe(this.model).pipe(parser);
      const result = await chain.invoke({ input: content, verbose: true });
      return result.trim(); // 返回翻译后的单段结果
    } catch (error) {
      console.error('Error summarizing content:', error);
      if (error.cause.code === 'UND_ERR_HEADERS_TIMEOUT') {
        return JSON.stringify({
          title: '',
          summary: '',
          key_points: [],
          tags: [],
          status: 'TIMEOUT',
        });
      }
      throw error;
    }
  }
}
