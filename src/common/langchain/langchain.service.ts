// src/services/langchain.service.ts

import { Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { ModelFactory } from './model-factory';

@Injectable()
export class LangchainService {
  private model: ChatOpenAI;

  constructor(private modelFactory: ModelFactory) {
    this.model = this.modelFactory.getModel('OpenAI'); // 默认使用 OpenAI 模型
  }

  async translateParagraphs(paragraphss?: string[]): Promise<string[]> {
    const paragraphs = [];
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        '下面我让你来充当翻译家，你的目标是把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。',
      ],
      ['user', '{input}'],
    ]);

    const chain = prompt.pipe(this.model);

    try {
      // 构造待翻译的段落对象
      const inputObject = paragraphs.reduce((acc, paragraph, index) => {
        acc[`field${index + 1}`] = paragraph;
        return acc;
      }, {});

      // 转换成 JSON 格式的字符串
      const input = JSON.stringify(inputObject, null, 2);

      const res = await chain.invoke({ input });
      console.log({ res });
      return Object.values(res); // 返回翻译后的结果数组
    } catch (error) {
      console.error('Error translating paragraphs:', error);
      throw error;
    }
  }
}
