import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateRssDto {
  @ApiProperty({
    description: 'URL of the RSS feed',
    example: 'http://example.com/rss',
  })
  @IsUrl()
  readonly sourceUrl: string;

  @ApiPropertyOptional({
    description: 'Custom name for the RSS feed',
    example: 'Example RSS Feed',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, {
    message: 'Custom name is too long. Max length is 255 characters.',
  })
  readonly customName?: string;
}
