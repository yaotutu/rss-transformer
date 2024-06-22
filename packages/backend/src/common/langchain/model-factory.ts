// src/models/model-factory.ts

import { Injectable } from '@nestjs/common';
import { ModelConfigService } from '../config/model-config.service';
import { ChatOpenAI } from '@langchain/openai';
import { WinstonService } from '../logger/winston.service';
import { Ollama } from '@langchain/community/llms/ollama';

@Injectable()
export class ModelFactory {
  private models = new Map<string, any>();

  constructor(
    private modelConfigService: ModelConfigService,
    private logger: WinstonService,
  ) {}

  getModel(modelType: string): any {
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
      // Add more model classes here as needed
      default:
        this.logger.error('MODEL_FACTORY', `Unknown model type: ${modelType}`);
        return null;
    }
  }
}
