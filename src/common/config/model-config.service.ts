// src/config/model-config.service.ts

import { Injectable, HttpStatus } from '@nestjs/common';
import { ApiException } from '../dto/common.dto';
import { WinstonService } from '../logger/winston.service';

@Injectable()
export class ModelConfigService {
  constructor(private readonly logger: WinstonService) {}

  private modelConfigMap: { [key: string]: () => any } = {
    OpenAI: () => ({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
      azureOpenAIApiEmbeddingsDeploymentName:
        process.env.AZURE_OPENAI_API_EMBEDDING_DEPLOYMENT_NAME,
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    }),
    Ollama: () => ({
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'qwen2:1.5b',
    }),
    // Add more model configs here as needed
  };

  getModelConfig(modelType: string): any {
    const configFn = this.modelConfigMap[modelType];
    if (configFn) {
      try {
        const config = configFn();
        this.logger.info('MODEL_CONFIG', modelType + ' config loaded');
        return config;
      } catch (error) {
        const message = `Failed to load model config for ${modelType}`;
        this.logger.error('MODEL_CONFIG', message, error);
        return new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, message);
      }
    }
    const message = `Unknown model type: ${modelType}`;
    this.logger.error('MODEL_CONFIG', message);
    return new ApiException(HttpStatus.BAD_REQUEST, message);
  }
}
