import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, Validate } from 'class-validator';
import { IsCronExpression } from './is-cron-expression.validator';

export class CreateTaskDto {
  @ApiProperty({
    description: '任务名称，方便自己记忆和查看',
    example: '总结xxx的rss',
  })
  @Optional()
  readonly name: string;

  @ApiProperty({
    description: '定时任务的调度规则，cron 表达式或类似格式',
    example: '*/10 * * * * *',
  })
  @Validate(IsCronExpression) // 使用自定义校验器
  @IsNotEmpty()
  readonly schedule: string;

  @ApiProperty({
    description:
      '任务类型，例如：rss的翻译、rss的总结,"TRANSLATE" | "UPDATE_RSS_ITEMS",   ',
    example: 'TRANSLATE',
    enum: ['TRANSLATE', 'UPDATE_RSS_ITEMS'],
  })
  @IsNotEmpty()
  @IsIn(['TRANSLATE', 'UPDATE_RSS_ITEMS'])
  readonly taskType: string;

  @ApiProperty({
    description: '要调用的函数名称',
    example: 'updateItem',
  })
  @IsNotEmpty()
  readonly functionName: string;

  @ApiProperty({
    description: '任务的数据或配置信息，可以是 JSON 字符串',
    example: { itemId: 1, itemName: 'Product A' },
  })
  @Optional()
  readonly taskData: any;

  @ApiProperty({
    description: '关联的 RSS 源 ID',
    example: 2,
  })
  @IsNotEmpty()
  readonly rssSourceId: number;

  @ApiProperty({
    description: '是否立即执行任务',
    example: false,
  })
  @Optional()
  readonly immediate?: boolean;
}
