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

  async getTest(): Promise<any> {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        '你是一个翻译官,我会给你一个json对象,你需要将以下字段对应的内容帮我翻译成中文,具体需要翻译的字段如下:',
      ],
      ['user', '{input}'],
    ]);
    const chain = prompt.pipe(this.model);

    try {
      const res = await chain.invoke({
        input: `
          {
            "field1": "This is some text that needs to be translated",
            "field2": "And also this text"
          }
        `,
      });
      console.log({ res });
      return res;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
