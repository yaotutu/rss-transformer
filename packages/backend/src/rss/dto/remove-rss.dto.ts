import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class RemoveRssDto {
  @ApiProperty({
    description: '要删除的 RSS 源 ID 的逗号分隔字符串',
    example: '1,2,3',
  })
  @IsString()
  @Matches(/^\d+(,\d+)*$/, {
    message: 'ids 格式不正确，应为逗号分隔的数字字符串，例如：1,2,3',
  })
  readonly ids: string;
}
