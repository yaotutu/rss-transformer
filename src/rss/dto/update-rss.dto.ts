import { PartialType } from '@nestjs/swagger';
import { CreateRssDto } from './create-rss.dto';

export class UpdateRssDto extends PartialType(CreateRssDto) {}
