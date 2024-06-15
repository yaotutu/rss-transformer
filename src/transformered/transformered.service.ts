import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/dto/common.dto';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
var RSS = require('rss');

@Injectable()
export class TransformeredService {
  constructor(private readonly rssPrismaService: RssPrismaService) {}
  async generateTransformeredByTaskId(id: number) {
    const rssJsonObj = await this.rssPrismaService.getTransformedRss(id);
    const {
      title,
      description,
      generator,
      feed_url,
      site_url,
      image_url,
      docs,
      managingEditor,
      webMaster,
      copyright,
      language,
      categories,
      pubDate,
      ttl,
      hub,
      items,
      //   lastBuildDate,
    } = rssJsonObj;

    // console.log(xml);
    return new ApiResponse<string>(
      200,
      'Success',
      this.jsonToRss(rssJsonObj),
      undefined,
      {
        isRss: true,
      },
    );
  }
  jsonToRss(json) {
    const { link, feedUrl, title, lastBuildDate, items } = json;

    let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
    rss += `  <channel>\n`;
    rss += `    <title><![CDATA[${title}]]></title>\n`;
    rss += `    <link>${link}</link>\n`;
    rss += `    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />\n`;
    rss += `    <description><![CDATA[${title}]]></description>\n`;
    rss += `    <lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>\n`;
    rss += `    <generator>Custom Node Script</generator>\n`;

    items.forEach((item) => {
      rss += `    <item>\n`;
      rss += `      <title><![CDATA[${item.title}]]></title>\n`;
      rss += `      <link>${item.link}</link>\n`;
      rss += `      <guid isPermaLink="true">${item.id}</guid>\n`;
      rss += `      <description><![CDATA[${item.content}]]></description>\n`;
      rss += `      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>\n`;
      rss += `    </item>\n`;
    });

    rss += `  </channel>\n`;
    rss += `</rss>`;

    return rss;
  }
}
