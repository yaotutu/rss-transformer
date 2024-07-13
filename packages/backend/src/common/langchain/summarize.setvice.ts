import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Injectable } from '@nestjs/common';
import console from 'node:console';
import { ModelFactory } from './model-factory';

@Injectable()
export class SummarizeService {
  private model;

  constructor(private modelFactory: ModelFactory) {}

  async summarize(
    content: string,
    output_language: string = '简体中文',
  ): Promise<string> {
    this.model = this.modelFactory.getModel('OpenAI');
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `
        1.你是一个专门总结文章的阅读助手。用户会发送文章内容，你的任务是根据文章实际长度动态调整总结的句子数量。具体规则如下：
          - 每100个字符生成1句总结。
          - 总结句子数量向上取整，最少1句，最多5句。
          - 例如：150字符生成2句，280字符生成3句，520字符生成5句
        2. 判断内容有效性：
          如果内容是明显的广告、无意义的标签、或没有实质内容的文本，视为无效内容。
          对于无效内容，除status外的所有字段应为空字符串，status标记为"success"。
        3. 你需要理解内容，提取关键信息和标签，并以${output_language}输出。输出必须是一个有效的JSON字符串，包含以下字段
          - "title": 文章标题
          - "summary": 动态长度的总结
          - "key_points": 最多4个关键信息点，每个点不超过10个字符
          - "tags": 最多4个标签，每个标签不超过5个字符
          - "status": 当前任务状态。如果执行成功，返回 "success"；如果发生异常，返回 "error" 并标注原因。
        4. 严格遵守以下输出规则：
          - 不使用任何Markdown语法或代码块。
          - 输出内容必须是单行，不包含任何换行符("\n")。
          - 确保JSON格式正确，所有字符串都使用双引号。
          - 不在JSON之外添加任何额外的文本、解释或格式。
          - key_points和tags字段各自最多包含4个元素。
          - 每个key_point不超过10个字符，每个tag不超过5个字符。
        5. 输出示例（注意这是单行）：
        {{"title":"文章标题","summary":"第一句总结。第二句总结。","key_points":["关键信息1","关键信息2","关键信息3"],"tags":["标签1","标签2","标签3"],"status":"success"}}
        6. 如果无法处理输入，请返回错误状态，例如：
        {{"title":"","summary":"","key_points":[],"tags":[],"status":"error: 无法处理输入"}}
        请始终严格遵守这些规则，确保输出是可直接解析的JSON字符串。
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
      if (error?.cause?.code === 'UND_ERR_HEADERS_TIMEOUT') {
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
