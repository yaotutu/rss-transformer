import { Injectable } from '@nestjs/common';
import { AzureOpenAIEmbeddings, ChatOpenAI, OpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class LangchainService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
      azureOpenAIApiEmbeddingsDeploymentName:
        process.env.AZURE_OPENAI_API_EMBEDDING_DEPLOYMENT_NAME,
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
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
