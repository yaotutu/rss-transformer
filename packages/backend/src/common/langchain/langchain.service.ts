import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Injectable } from '@nestjs/common';
import { HtmlSplitterService } from '../rss-parser/html-splitter.service';
import { ModelFactory } from './model-factory';

@Injectable()
export class LangchainService {
  private model;

  constructor(
    private modelFactory: ModelFactory,
    private htmlSplitterService: HtmlSplitterService, // 注入 HtmlSplitterService
  ) {}

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
  ): Promise<string> {
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
        5. 如果遇到标点符号等特殊字符，请保持其位置和格式不变。`,
      ],
      ['user', '{input}'],
    ]);
    const parser = new StringOutputParser();

    try {
      const chain = prompt.pipe(this.model).pipe(parser);
      const result = await chain.invoke({ input: data });
      return result.trim(); // 返回翻译后的单段结果
    } catch (error) {
      console.error('Error translating single paragraph:', error);
      throw error;
    }
  }

  /**
   * Translates and splits a paragraph from one language to another, with optional parallel processing.
   * @param data - The paragraph to be translated.
   * @param originLang - The language of the original paragraph. Defaults to '英文' (English).
   * @param targetLang - The language to translate the paragraph into. Defaults to '中文' (Chinese).
   * @param maxLength - The maximum length of each split chunk. Defaults to 1000.
   * @param isParallel - Whether to execute translation tasks in parallel. Defaults to true.
   * @returns The translated paragraph.
   * @throws Throws an error if there is an issue translating the paragraph.
   */
  async translateAndSplitParagraph(
    data: string,
    originLang: string = '英文',
    targetLang: string = '中文',
    maxLength: number = 1000,
    isParallel: boolean = false,
  ): Promise<string> {
    this.model = this.modelFactory.getModel('Ollama');

    try {
      // 使用 HtmlSplitterService 进行 HTML 内容切割
      const splitParagraphs = this.htmlSplitterService.splitHtmlContent(
        data,
        maxLength,
      );

      let translatedParts;
      if (isParallel) {
        // 并行执行翻译
        const translatedPartsPromises = splitParagraphs.map(async (part) => {
          const translatedPart = await this.translateSingleParagraph(
            part.htmlContent, // 只翻译 HTML 内容
            originLang,
            targetLang,
          );
          return {
            htmlContent: translatedPart,
            level: part.level,
          };
        });
        translatedParts = await Promise.all(translatedPartsPromises);
      } else {
        // 串行执行翻译
        translatedParts = [];
        for (const part of splitParagraphs) {
          const translatedPart = await this.translateSingleParagraph(
            part.htmlContent, // 只翻译 HTML 内容
            originLang,
            targetLang,
          );
          translatedParts.push({
            htmlContent: translatedPart,
            level: part.level,
          });
        }
      }

      // 使用 combineChunks 方法将处理后的块结构还原回完整的 HTML 字符串
      const translatedContent =
        this.htmlSplitterService.combineChunks(translatedParts);

      return translatedContent; // 返回翻译后的完整字符串
    } catch (error) {
      console.error('Error translating and splitting paragraph:', error);
      throw error;
    }
  }
}
