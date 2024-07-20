import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { TranslateTaskDataDto } from './translate-task-data.dto';
// import other DTOs as needed

export class TaskDataWrapperDto {
  @ApiProperty({
    description: '任务类型，例如: "TRANSLATE"',
    example: 'TRANSLATE',
  })
  @IsNotEmpty()
  @IsString()
  taskType: string;

  @ApiProperty({
    description: '具体的任务数据，根据 taskType 不同而不同',
    example: {
      model: 'OpenAI',
      originLang: '繁体中文',
      targetLang: '简体中文',
      customPrompt: '',
    },
  })
  @ValidateNested() // 告诉 class-validator 需要验证嵌套对象
  @Type(() => TranslateTaskDataDto) // 将 data 转换为 TranslateTaskDataDto 对象
  data: TranslateTaskDataDto;
}
