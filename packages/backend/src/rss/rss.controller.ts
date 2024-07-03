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

  /**
   * Create a new RSS source.
   * @param createRssDto - The data for creating the RSS source.
   * @returns The created RSS source.
   */
  @Post()
  create(@Body() createRssDto: CreateRssDto) {
    return this.rssService.create(createRssDto);
  }

  /**
   * Get all RSS sources.
   * @returns All RSS sources.
   */
  @Get()
  findAll() {
    return this.rssService.getAllRssSources();
  }

  /**
   * Get a specific RSS source by ID.
   * @param id - The ID of the RSS source.
   * @returns The RSS source with the specified ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('id', typeof id);
    return this.rssPrismaService.getRssSourceById(+id);
  }

  /**
   * Update a specific RSS source by ID.
   * @param id - The ID of the RSS source to update.
   * @returns The result of the update operation.
   */
  @Get('update/:id')
  update(@Param('id', ParseIntPipe) id: string) {
    console.log('id', typeof id, id);
    return this.rssService.test();
  }

  /**
   * Delete RSS sources.
   * @param dto - The data for removing RSS sources.
   * @returns The result of the delete operation.
   */
  @Delete()
  delete(@Query() dto: RemoveRssDto) {
    const idsArray = dto.ids.split(',').map((id) => parseInt(id, 10));
    return this.rssPrismaService.deleteRssSources(idsArray);
  }
}
