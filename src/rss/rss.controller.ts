import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RssService } from './rss.service';
import { CreateRssDto } from './dto/create-rss.dto';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';

@Controller('rss')
export class RssController {
  constructor(
    private readonly rssService: RssService,
    private readonly rssPrismaService: RssPrismaService,
  ) {}

  @Post()
  create(@Body() createRssDto: CreateRssDto) {
    return this.rssService.create(createRssDto);
  }

  @Get()
  findAll() {
    return this.rssService.getAllRssSources();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('id', typeof id);
    return this.rssPrismaService.getRssSourceById(+id);
  }
  @Get('update/:id')
  update(@Param('id', ParseIntPipe) id: string) {
    console.log('id', typeof id, id);
    return this.rssService.test();
  }
}
