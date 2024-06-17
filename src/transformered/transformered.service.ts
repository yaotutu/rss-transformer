import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/dto/common.dto';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import { JsonToXmlService } from 'src/common/rss-parser/json-to-xml.service';

@Injectable()
export class TransformeredService {
  constructor(
    private readonly rssPrismaService: RssPrismaService,
    private readonly jsonToXmlService: JsonToXmlService,
  ) {}

  async generateTransformeredByTaskId(
    id: number,
  ): Promise<ApiResponse<string>> {
    const rssJsonObj =
      await this.rssPrismaService.getTransformedRssByTaskId(id);
    const xml = this.jsonToXmlService.convertToJsonToXml(rssJsonObj, 'atom');
    return new ApiResponse<string>(200, 'Success', xml, undefined, {
      isRss: true,
    });
  }
}
