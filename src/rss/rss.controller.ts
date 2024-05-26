import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RssService } from './rss.service';
import { CreateRssDto } from './dto/create-rss.dto';
import { UpdateRssDto } from './dto/update-rss.dto';

@Controller('rss')
export class RssController {
  constructor(private readonly rssService: RssService) {}

  @Post()
  create(@Body() createRssDto: CreateRssDto) {
    return this.rssService.create(createRssDto);
  }

  @Get()
  findAll() {
    return this.rssService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rssService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRssDto: UpdateRssDto) {
    return this.rssService.update(+id, updateRssDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rssService.remove(+id);
  }
}
