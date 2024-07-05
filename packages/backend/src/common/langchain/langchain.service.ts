import { StringOutputParser } from '@langchain/core/output_parsers';
import { Injectable } from '@nestjs/common';
import { HtmlSplitterService } from '../rss-parser/html-splitter.service';
import { ModelFactory } from './model-factory';
import {
  getSingleParagraphTranslationPrompt,
  getTranslationPrompt,
} from './translation.prompts';

@Injectable()
export class LangchainService {
  private model;

  constructor(
    private modelFactory: ModelFactory,
    private htmlSplitterService: HtmlSplitterService, // 注入 HtmlSplitterService
  ) {
    this.model = this.modelFactory.getModel('OpenAI');
  }

  /**
   * Translates an array of paragraphs from one language to another.
   * @param paragraphs - The array of paragraphs to be translated.
   * @param originLang - The language of the original paragraphs. Defaults to '英文'.
   * @param targetLang - The language to translate the paragraphs into. Defaults to '中文'.
   * @returns The translated paragraphs as an array.
   * @throws Throws an error if there is an issue translating the paragraphs.
   */
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

  /**
   * Translates a single paragraph from one language to another.
   * @param data - The paragraph to be translated.
   * @param originLang - The language of the original paragraph. Defaults to '英文'.
   * @param targetLang - The language to translate the paragraph into. Defaults to '中文'.
   * @returns The translated paragraph.
   * @throws Throws an error if there is an issue translating the paragraph.
   */
  async translateSingleParagraph(
    data: string,
    originLang: string = '英文',
    targetLang: string = '中文',
    maxLength: number = 1000,
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

  /**
   * Translates a single paragraph from one language to another, splitting it if necessary.
   * @param data - The paragraph to be translated.
   * @param originLang - The language of the original paragraph. Defaults to '英文'.
   * @param targetLang - The language to translate the paragraph into. Defaults to '中文'.
   * @param maxLength - The maximum length of each split chunk. Defaults to 1000.
   * @returns The translated paragraph.
   * @throws Throws an error if there is an issue translating the paragraph.
   */
  async translateAndSplitParagraph(
    data: string,
    originLang: string = '英文',
    targetLang: string = '中文',
    maxLength: number = 1000,
  ) {
    try {
      // 使用 HtmlSplitterService 进行 HTML 内容切割
      const splitParagraphs = this.htmlSplitterService.splitHtmlContent(
        data,
        maxLength,
      );

      // 遍历切割后的段落数组并进行翻译
      const translatedParts = [];
      for (const part of splitParagraphs) {
        const translatedPart = await this.translateSingleParagraph(
          part,
          originLang,
          targetLang,
        );
        translatedParts.push(translatedPart);
      }

      // 将翻译后的段落重新拼接成一个字符串
      const translatedContent = translatedParts.join(''); // 拼接翻译后的段落

      return translatedContent; // 返回翻译后的完整字符串
    } catch (error) {
      console.error('Error translating and splitting paragraph:', error);
      throw error;
    }
  }
  testFn() {
    console.log('testFn');
  }
}
