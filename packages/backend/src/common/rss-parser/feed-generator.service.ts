import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
const xmlFormat = require('xml-formatter').default || require('xml-formatter');

@Injectable()
export class FeedGeneratorService {
  private rssTemplate: Handlebars.TemplateDelegate;
  private atomTemplate: Handlebars.TemplateDelegate;

  constructor() {
    this.rssTemplate = Handlebars.compile(`
      <rss version="2.0">
        <channel>
          {{#each this}}
              {{{renderNode @key this}}}
          {{/each}}
        </channel>
      </rss>
    `);

    this.atomTemplate = Handlebars.compile(`
      <feed xmlns="http://www.w3.org/2005/Atom">
        {{#each this}}
          {{{renderNode @key this}}}
        {{/each}}
      </feed>
    `);

    Handlebars.registerHelper('renderNode', (key, value) => {
      if (key === 'item') {
        return value
          .map((item: any) => {
            return `<item>${Object.keys(item)
              .map((itemKey) =>
                Handlebars.helpers.renderNode(itemKey, item[itemKey]),
              )
              .join('')}</item>`;
          })
          .join('');
      }
      if (key === 'description') {
        // 包装 description 内容为 CDATA
        return `<${key}><![CDATA[${value}]]></${key}>`;
      }
      if (typeof value === 'object' && !Array.isArray(value)) {
        let attributes = '';
        let content = '';
        for (const [subKey, subValue] of Object.entries(value)) {
          if (subKey === '$') {
            attributes = Object.entries(subValue)
              .map(([attrKey, attrValue]) => `${attrKey}="${attrValue}"`)
              .join(' ');
          } else if (subKey === '_') {
            content = subValue as string;
          } else {
            content += Handlebars.helpers.renderNode(subKey, subValue);
          }
        }
        return `<${key} ${attributes.trim()}>${content}</${key}>`;
      } else {
        return `<${key}>${value}</${key}>`;
      }
    });

    Handlebars.registerHelper('eq', (a, b) => {
      return a === b;
    });
  }
  generateFeed(jsonData: any, feedType: string): string {
    let xmlString: string;
    if (feedType === 'rss2') {
      xmlString = this.generateRssFeed(jsonData);
    } else if (feedType === 'atom') {
      xmlString = this.generateAtomFeed(jsonData);
    } else {
      throw new Error('Invalid feed type');
    }

    return xmlFormat(xmlString, {
      indentation: '  ', // 使用两个空格进行缩进
      collapseContent: true, // 折叠内容
      lineSeparator: '\n', // 换行符
    });
  }

  private generateRssFeed(jsonData: any): string {
    return this.rssTemplate(jsonData);
  }

  private generateAtomFeed(jsonData: any): string {
    return this.atomTemplate(jsonData);
  }
}
