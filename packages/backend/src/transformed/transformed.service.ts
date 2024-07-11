import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/dto/common.dto';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import { FeedGeneratorService } from 'src/common/rss-parser/feed-generator.service';
import { JsonToXmlService } from 'src/common/rss-parser/json-to-xml.service';

@Injectable()
export class TransformedService {
  constructor(
    private readonly rssPrismaService: RssPrismaService,
    private readonly jsonToXmlService: JsonToXmlService,
    private readonly feedGeneratorService: FeedGeneratorService,
  ) {}

  async generateTransformedByTaskId(id: number): Promise<ApiResponse<string>> {
    const { rssJson, feedType } =
      await this.rssPrismaService.getTransformedRssByTaskId(id);
    const xml = this.feedGeneratorService.generateFeed(rssJson, feedType);
    return new ApiResponse<string>(200, 'Success', xml, undefined, {
      isRss: true,
    });
  }

  async generateSummarizedByTaskId(id: number): Promise<ApiResponse<string>> {
    const { rssJson, feedType } =
      await this.rssPrismaService.getTransformedRssByTaskId(id);
    const xml = this.feedGeneratorService.generateFeed(rssJson, feedType);
    return new ApiResponse<string>(200, 'Success', xml, undefined, {
      isRss: true,
    });
  }
}
