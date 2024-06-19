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

  async translateParagraphs(data?: string[]) {
    const paragraphs = data || [
      '<p> [&#8230;]</p>\n<p>本篇文章 <a rel="nofollow" href="https://mrmad.com.tw/microsoft-suspends-three-versions-of-outlook">微軟宣布停用Outlook三類版本，快檢查避免無法登入帳號</a> 最早出現在 <a rel="nofollow" href="https://mrmad.com.tw">瘋先生</a> 網站上。</p>\n',
      '<p> [&#8230;]</p>\n<p>本篇文章 <a rel="nofollow" href="https://mrmad.com.tw/aiarty-image-enhancer">AI照片修復軟體Aiarty Image Enhancer限免！輕鬆修復模糊照片</a> 最早出現在 <a rel="nofollow" href="https://mrmad.com.tw">瘋先生</a> 網站上。</p>\n',
    ]; // 处理传入的段落数组
    const separator = '\n---\n'; // 定义段落分隔符

    // 构造待翻译的段落字符串，使用分隔符分隔
    const input = paragraphs.join(separator);

    // 定义翻译的 Prompt 模板
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `你是一个翻译专家，你的目标是把任何语言翻译成中文。
        请确保以下几点：
        1. 保留每个段落的原始 HTML 结构和格式，只翻译标签内的文本内容。
        2. 如果段落是纯文本，则直接翻译替换。
        3. 每个段落都是独立的，它们之间的翻译不需要有任何关联性。
        4. 段落的前后顺序必须保持一致，不能混乱。
        5. 段落之间使用“---”分隔。`,
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
}
