import { Injectable } from '@nestjs/common';
import { AzureOpenAIEmbeddings, ChatOpenAI, OpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class LangchainService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      azureOpenAIApiKey: '', // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
      azureOpenAIApiInstanceName: 'yao2', // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
      azureOpenAIApiEmbeddingsDeploymentName: 'text-emb-3', // In Node.js defaults to process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME
      azureOpenAIApiVersion: '2024-02-15-preview', // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
      azureOpenAIApiDeploymentName: 'gpt35',
    });
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
        
        `,
      });
      console.log({ res });
      return res;
    } catch (error) {
      console.log(error);
    }
  }
}
