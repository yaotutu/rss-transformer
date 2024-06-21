import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, ValidateNested, IsIn, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { DynamicTaskDataValidator } from './dynamic-task-data-validator';

export class TaskDataDto {
  @ApiProperty({
    description: '任务类型，例如: "TRANSLATE" 或 "FILTER"',
    example: 'TRANSLATE',
    enum: ['TRANSLATE', 'FILTER'],
  })
  @IsIn(['TRANSLATE', 'FILTER'])
  @IsNotEmpty()
  taskType: string;

  @ApiProperty({
    description: '任务的数据或配置信息，根据任务类型会有所不同',
    example: {
      model: 'OpenAI',
      taskType: 'translation',
      originLang: '繁体中文',
      targetLang: '简体中文',
      customPrompt: '',
    },
  })
  @ValidateNested()
  @Type(() => Object)
  @Validate(DynamicTaskDataValidator)
  data: any;
}
