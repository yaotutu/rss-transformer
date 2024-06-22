import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TranslateTaskDataDto {
  @ApiProperty({
    description: '模型名称，例如: "OpenAI"',
    example: 'OpenAI',
  })
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty({
    description: '源语言，例如: "繁体中文"',
    example: '繁体中文',
  })
  @IsNotEmpty()
  @IsString()
  originLang: string;

  @ApiProperty({
    description: '目标语言，例如: "简体中文"',
    example: '简体中文',
  })
  @IsNotEmpty()
  @IsString()
  targetLang: string;

  @ApiProperty({
    description: '自定义提示词，可选字段',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  customPrompt?: string;
}
