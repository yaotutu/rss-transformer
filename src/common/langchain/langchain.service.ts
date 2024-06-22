// src/services/langchain.service.ts

import { Injectable } from '@nestjs/common';
import { ModelFactory } from './model-factory';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  getSingleParagraphTranslationPrompt,
  getTranslationPrompt,
} from './translation.prompts';

@Injectable()
export class LangchainService {
  private model;

  constructor(private modelFactory: ModelFactory) {
    this.model = this.modelFactory.getModel('OpenAI'); // 默认使用 OpenAI 模型
  }

  async translateParagraphs(
    paragraphs: string[],
    originLang: string = '英文',
    targetLang: string = '中文',
  ) {
    const separator = '<<<>>>SEPARATOR-1234567890-ABCDEFGHIJKLMN<<<>>>'; // 定义新的分隔符

    // 构造待翻译的段落字符串，使用分隔符分隔
    const input = paragraphs.join(separator);

    // 获取翻译的 Prompt 模板
    const prompt = getTranslationPrompt(originLang, targetLang, separator);

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
    originLang: string = '英文',
    targetLang: string = '中文',
  ) {
    // 获取单段翻译的 Prompt 模板
    const prompt = getSingleParagraphTranslationPrompt(originLang, targetLang);

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
