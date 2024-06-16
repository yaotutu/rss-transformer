import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/dto/common.dto';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import * as xml2js from 'xml2js';

@Injectable()
export class TransformeredService {
  constructor(private readonly rssPrismaService: RssPrismaService) {}
  async generateTransformeredByTaskId(id: number) {
    const rssJsonObj =
      await this.rssPrismaService.getTransformedRssByTaskId(id);
    // console.log(xml);
    const xml = this.jsonToXml(rssJsonObj);
    return new ApiResponse<string>(200, 'Success', xml, undefined, {
      isRss: true,
    });
  }

  jsonToXml(jsonData) {
    var builder = new xml2js.Builder({
      explicitRoot: false,
      rootName: 'feed',
    });
    var xml = builder.buildObject(jsonData);
    const removedRootXml = xml.replace(/<root[^>]*>|<\/root>/g, '');

    // 返回生成的 XML
    return removedRootXml;
  }
}
