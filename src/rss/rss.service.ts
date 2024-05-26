import { Injectable } from '@nestjs/common';
import { CreateRssDto } from './dto/create-rss.dto';
import { UpdateRssDto } from './dto/update-rss.dto';

@Injectable()
export class RssService {
  create(createRssDto: CreateRssDto) {
    return 'This action adds a new rss';
  }

  findAll() {
    return `This action returns all rss`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rss`;
  }

  update(id: number, updateRssDto: UpdateRssDto) {
    return `This action updates a #${id} rss`;
  }

  remove(id: number) {
    return `This action removes a #${id} rss`;
  }
}
