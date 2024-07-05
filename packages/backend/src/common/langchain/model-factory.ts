// src/models/model-factory.ts

import { ChatBaiduQianfan } from '@langchain/baidu-qianfan'; // 添加这一行
import { Ollama } from '@langchain/community/llms/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ModelConfigService } from '../config/model-config.service';
import { WinstonService } from '../logger/winston.service';

type ModelType = 'OpenAI' | 'Ollama' | 'QianFan';
@Injectable()
export class ModelFactory {
  private models = new Map<string, any>();

  constructor(
    private modelConfigService: ModelConfigService,
    private logger: WinstonService,
  ) {}

  getModel(modelType: ModelType): any {
    try {
      if (!this.models.has(modelType)) {
        const config = this.modelConfigService.getModelConfig(modelType);
        const ModelClass = this.getModelClass(modelType);
        if (!ModelClass) {
          this.logger.error(
            'MODEL_FACTORY',
            `Unknown model type: ${modelType}`,
          );
          return null;
        }
        const modelInstance = new ModelClass(config);
        this.models.set(modelType, modelInstance);
      }

      return this.models.get(modelType);
    } catch (error) {
      this.logger.error(
        'MODEL_FACTORY',
        `Failed to get model ${modelType}`,
        error,
      );
      return null;
    }
  }

  private getModelClass(modelType: string): any {
    switch (modelType) {
      case 'OpenAI':
        return ChatOpenAI; // Assuming ChatOpenAI is the model class
      case 'Ollama': // 添加这一行
        return Ollama; // 添加这一行
      case 'QianFan':
        return ChatBaiduQianfan;
      default:
        this.logger.error('MODEL_FACTORY', `Unknown model type: ${modelType}`);
        return null;
    }
  }
}
