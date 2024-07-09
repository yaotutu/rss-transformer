import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { HtmlToTextTransformer } from '@langchain/community/document_transformers/html_to_text';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Injectable } from '@nestjs/common';
import { ConversationChain } from 'langchain/chains';
import { BufferWindowMemory } from 'langchain/memory';
import { ModelFactory } from '../langchain/model-factory';

@Injectable()
export class FullContentService {
  private chain: any; // ConversationChain 对象用于处理上下文
  private memory: any; // BufferWindowMemory 对象用于存储对话历史
  constructor(private modelFactory: ModelFactory) {
    this.memory = new BufferWindowMemory({ k: 1 });
    const model = this.modelFactory.getModel('OpenAI');
    this.chain = new ConversationChain({ llm: model, memory: this.memory });
  }

  async fetchAndProcessUrl(url: string) {
    try {
      const loader = new CheerioWebBaseLoader(url);
      const docs = await loader.load();
      const splitter = RecursiveCharacterTextSplitter.fromLanguage('html');
      const transformer = new HtmlToTextTransformer();
      const sequence = splitter.pipe(transformer);
      const newDocuments = await sequence.invoke(docs);
      console.log('Processed documents:', newDocuments);

      // 提示开始数据传输
      // console.log(
      //   'Initiating data transmission to GPT model: Sending multiple data chunks, please wait until all chunks are sent.',
      // );
      const initialPrompt = `
      我将发送多个数据块。在看到字段 "END_OF_TRANSMISSION" 之前，请不要做任何答复，也不要回复任何信息，只需等待我发送所有数据。
      1. 每个数据块都会被特殊符号 "###START_OF_BLOCK###" 和 "###END_OF_BLOCK###" 包围。请确保识别这些符号并接受它们之间的内容。
      2. 当你看到 "END_OF_TRANSMISSION" 时，表示我已经发送完所有数据。
      3. 在这之前，你只需记录就好，不要做任何答复，你也不需要做任何操作。
      请严格按照以上步骤操作，确保数据的完整性和准确性。谢谢！
      `;
      const initialResponse = await this.chain.invoke({ input: initialPrompt });
      console.log({ initialResponse });
      for (const doc of newDocuments) {
        const input = `###START_OF_BLOCK###\n${doc.pageContent}\n###END_OF_BLOCK###`;
        console.log('Sending prompt to GPT model:', input);
        const contentResp = await this.chain.invoke({ input });
        console.log(contentResp);
      }

      // 最终提示词，指示开始处理并提取正文
      const finalInput = `
      END_OF_TRANSMISSION
      我已经发送完所有数据，现在请开始处理并提取正文。请将提取的正文发送给我。在完成时，请发送字段 "END_OF_RESPONSE"。`;
      const finalResp = await this.chain.invoke({ input: finalInput });

      console.log(finalResp);

      // 第一次发送数据时明确告知模型将发送多个数据块
      // console.log('Sending initial prompt to GPT model:', initialPrompt);
      // await this.chain.invoke({
      //   input: initialPrompt,
      // });

      // for (let i = 0; i < newDocuments.length; i++) {
      //   const doc = newDocuments[i];
      //   const prompt = doc.pageContent;
      //   console.log(
      //     `Sending data chunk ${i + 1}/${newDocuments.length} to GPT model:`,
      //     prompt,
      //   );

      // 发送数据给大模型
      //   const response = await this.chain.invoke({
      //     input: prompt,
      //   });
      //   let result = response.text || '';

      //   // 累加处理结果
      //   accumulatedResult += result.trim() + '\n';
      // }

      // // 提示数据传输结束
      // console.log('Data transmission to GPT model completed');

      // // 提取正文并返回
      // console.log('Extracting summary from GPT model');
      // const summary = await this.extractSummary();
      // accumulatedResult += summary.trim();

      // return accumulatedResult.trim();
    } catch (error) {
      console.error('Error fetching and processing URL:', error);
      throw error;
    }
  }

  async extractSummary(): Promise<string> {
    const finalPrompt = `Please split the summary into segments of up to 1000 characters each. After each segment, please continue outputting the next segment until all segments are completed. Please include the end marker "END_OF_RESPONSE" in the last segment.`;
    console.log('Sending final prompt to GPT model:', finalPrompt);
    const completeResponse = await this.getCompleteResponse(finalPrompt);
    return '\n\n' + completeResponse.trim();
  }

  async getCompleteResponse(
    prompt: string,
    accumulatedResult: string = '',
  ): Promise<string> {
    console.log('Sending prompt to GPT model:', prompt);
    const response = await this.chain.invoke({
      input: prompt,
    });
    const result = response.text || '';

    const endMarker = 'END_OF_RESPONSE';
    const isComplete = result.includes(endMarker);

    if (isComplete) {
      console.log('Received complete response:', result);
      return accumulatedResult + result.replace(endMarker, '');
    } else {
      console.log('Partial response received:', result);
      const newPrompt = this.getContinuationPrompt(result);
      return this.getCompleteResponse(newPrompt, accumulatedResult + result);
    }
  }

  getContinuationPrompt(lastResult: string): string {
    return `Please continue outputting the remaining content, following the previous text: "${lastResult}"`;
  }
}
