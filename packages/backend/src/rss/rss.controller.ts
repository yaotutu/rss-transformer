import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Delete,
  Query,
} from '@nestjs/common';
import { RssService } from './rss.service';
import { CreateRssDto } from './dto/create-rss.dto';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import { RemoveRssDto } from './dto/remove-rss.dto';

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
  @Delete()
  delete(@Query() dto: RemoveRssDto) {
    const idsArray = dto.ids.split(',').map((id) => parseInt(id, 10));
    return this.rssPrismaService.deleteRssSources(idsArray);
  }
}
