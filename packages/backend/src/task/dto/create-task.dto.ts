import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskDataWrapperDto } from './translate-task-data-wrapper.dto';

export class CreateTaskDto {
  @ApiProperty({
    description: '任务名称，方便自己记忆和查看',
    example: '总结xxx的rss',
  })
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: '定时任务的调度规则，cron 表达式或类似格式',
    example: '*/10 * * * * *',
  })
  @IsNotEmpty()
  readonly schedule: string;

  @ApiProperty({
    description:
      '任务类型，例如：rss的翻译、rss的总结,"TRANSLATE" | "UPDATE_RSS_ITEMS"',
    example: 'TRANSLATE',
    enum: ['TRANSLATE', 'UPDATE_RSS_ITEMS'],
  })
  @IsNotEmpty()
  @IsIn(['TRANSLATE', 'UPDATE_RSS_ITEMS'])
  readonly taskType: string;

  @ApiProperty({
    description: '任务的数据或配置信息，可以是 JSON 字符串',
    example: {
      taskType: 'TRANSLATE',
      data: {
        model: 'OpenAI',
        originLang: '繁体中文',
        targetLang: '简体中文',
        customPrompt: '',
      },
    },
  })
  @ValidateNested() // 告诉 class-validator 需要验证嵌套对象
  @Type(() => TaskDataWrapperDto) // 将 taskData 转换为 TaskDataWrapperDto 对象
  @IsOptional()
  readonly taskData: TaskDataWrapperDto;

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
  @IsNotEmpty()
  readonly immediate: boolean;

  @ApiProperty({
    description: '关联的 RSS 源 URL',
    example: 'https://example.com/rss',
  })
  @IsNotEmpty()
  readonly rssSourceUrl: string;

  @ApiProperty({
    description: 'RSS 项的标签',
    example: '["summary","content"]',
  })
  @IsOptional()
  readonly rssItemTag: JSON;
}
