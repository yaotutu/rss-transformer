import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { FullContentService } from './common/full-content/full-content.service';
import { HtmlSplitterService } from './common/rss-parser/html-splitter.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly htmlSplitterService: HtmlSplitterService,
    private readonly FullContentService: FullContentService, // 注入 FullContentService
  ) {}

  @Get()
  async getHello() {
    const res = await this.FullContentService.fetchAndProcessUrl(
      'https://mrmad.com.tw/taishinbank-tsrose-apollo-card',
    );
    return res;
  }
}
