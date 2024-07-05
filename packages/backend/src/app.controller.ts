import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HtmlSplitterService } from './common/rss-parser/html-splitter.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly htmlSplitterService: HtmlSplitterService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
