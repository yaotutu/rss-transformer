import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ModelFactory } from '../langchain/model-factory';

@Injectable()
export class FullContentService {
  constructor(private modelFactory: ModelFactory) {}

  async getCompleteResponse(
    model: any,
    prompt: string,
    accumulatedResult: string = '',
  ): Promise<string> {
    console.log('Sending prompt to GPT model:', prompt);
    const response = await this.sendToGPT(model, prompt);
    const result = response;

    const endMarker = 'END_OF_RESPONSE';
    const isComplete = result.includes(endMarker);

    if (isComplete) {
      console.log('Received complete response:', result);
      return accumulatedResult + result.replace(endMarker, '');
    } else {
      console.log('Partial response received:', result);
      const newPrompt = this.getContinuationPrompt(result);
      return this.getCompleteResponse(
        model,
        newPrompt,
        accumulatedResult + result,
      );
    }
  }

  getContinuationPrompt(lastResult: string): string {
    return `请继续输出剩余内容，接着之前的文本：“${lastResult}”`;
  }

  async processChunks(chunks: string[]): Promise<string> {
    const model = this.modelFactory.getModel('QianFan');

    await this.sendToGPT(
      model,
      `我将发送多个数据块。请等待所有数据发送完成后再进行处理。`,
    );

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(
        `Sending chunk ${i + 1}/${chunks.length} to GPT model:\n${chunk}`,
      );
      await this.sendToGPT(model, `以下是一个数据块：\n${chunk}`);
    }

    console.log('All chunks sent to GPT model');
    await this.sendToGPT(model, `所有数据块已发送完成，请开始总结。`);

    const finalPrompt = `请将总结结果分成每段不超过 1000 字符的小段输出。每段输出完毕后，请继续输出下一段，直到全部输出完成。请在最后一段输出时包含结束标记 "END_OF_RESPONSE"。`;
    console.log('Sending final prompt to GPT model:', finalPrompt);
    const completeResponse = await this.getCompleteResponse(model, finalPrompt);
    return completeResponse;
  }

  async sendToGPT(model: any, prompt: string): Promise<any> {
    console.log('Sending prompt to GPT model:', prompt);
    const response = await model.predict(prompt);
    console.log('Received response from GPT model:', response.text);
    return response;
  }

  async fetchAndProcessUrl(url: string): Promise<string> {
    try {
      console.log(`Fetching content from URL: ${url}`);
      const response = await axios.get(url);
      const html = response.data;

      console.log('Parsing HTML content');
      const $ = cheerio.load(html);
      const textContent = $('body').text();

      console.log('Splitting content into chunks');
      const chunkSize = 1000;
      const chunks = [];
      for (let i = 0; i < textContent.length; i += chunkSize) {
        chunks.push(textContent.substring(i, i + chunkSize));
      }

      console.log('Processing chunks with GPT model');
      const result = await this.processChunks(chunks);
      return result;
    } catch (error) {
      console.error('Error fetching and processing URL:', error);
      throw error;
    }
  }
}
