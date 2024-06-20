// src/services/langchain.service.ts

import { Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ModelFactory } from './model-factory';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class LangchainService {
  private model;

  constructor(private modelFactory: ModelFactory) {
    this.model = this.modelFactory.getModel('OpenAI'); // 默认使用 OpenAI 模型
  }

  async translateParagraphs(
    paragraphs: string[],
    originLang?: string,
    targetLang?: string,
  ) {
    originLang = originLang || '英文';
    targetLang = targetLang || '中文';
    paragraphs = paragraphs || [];
    const separator = '<<<>>>SEPARATOR-1234567890-ABCDEFGHIJKLMN<<<>>>'; // 定义新的分隔符

    // 构造待翻译的段落字符串，使用分隔符分隔
    const input = paragraphs.join(separator);

    // 定义翻译的 Prompt 模板
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `你是一个翻译专家，你的目标是把任何${originLang}的文本内容翻译成${targetLang}。
        请确保以下几点：
        1. 保留每个段落的原始 HTML 结构和格式，只翻译标签内的文本内容。
        2. 如果段落是纯文本，则直接翻译替换。
        3. 每个段落都是独立的，它们之间的翻译不需要有任何关联性。
        4. 段落的前后顺序必须保持一致，不能混乱。
        5. 段落之间使用“<<<>>>SEPARATOR-1234567890-ABCDEFGHIJKLMN<<<>>>”分隔。`,
      ],
      ['user', '{input}'],
    ]);

    // 创建一个 StringOutputParser 实例用于解析模型的输出
    const parser = new StringOutputParser();

    try {
      // 构建管道，依次执行 prompt -> model -> parser
      const chain = prompt.pipe(this.model).pipe(parser);

      // 执行处理管道，并获取翻译结果
      const result = await chain.invoke({ input });

      // 解析翻译后的段落
      const translatedParagraphs = result
        .split(separator)
        .map((paragraph) => paragraph.trim());
      console.log({ translatedParagraphs });

      return translatedParagraphs; // 返回翻译后的结果数组
    } catch (error) {
      console.error('Error translating paragraphs:', error);
      throw error;
    }
  }

  async translateSingleParagraph(
    data: string,
    originLang?: string,
    targetLang?: string,
  ) {
    originLang = originLang || '英文';
    targetLang = targetLang || '中文';
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `你是一个翻译专家，你的目标是把任何${originLang}的文本内容翻译成${targetLang}。
        请确保以下几点：
        1. 保留段落的原始 HTML 结构和格式，只翻译标签内的文本内容。
        2. 如果段落是纯文本，则直接翻译替换。
        3. 段落之间的顺序必须保持一致，不能混乱。
        4. 以下是示例输入和输出：
        输入: <p>Hello <a href="link">world</a></p>
        输出: <p>你好 <a href="link">世界</a></p>
        5. 如果遇到标点符号等特殊字符，请保持其位置和格式不变。
        `,
      ],
      ['user', '{input}'],
    ]);

    const parser = new StringOutputParser();

    try {
      const chain = prompt.pipe(this.model).pipe(parser);
      const result = await chain.invoke({ input: data });

      console.log({ translatedResult: result.trim() });

      return result.trim(); // 返回翻译后的单段结果
    } catch (error) {
      console.error('Error translating single paragraph:', error);
      throw error;
    }
  }
}
