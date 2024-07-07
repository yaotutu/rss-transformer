import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

@Injectable()
export class FeedGeneratorService {
  private rssTemplate: Handlebars.TemplateDelegate;
  private atomTemplate: Handlebars.TemplateDelegate;

  constructor() {
    this.rssTemplate = Handlebars.compile(`
      <rss version="2.0">
        <channel>
          {{#each this}}
            {{#if (eq @key "item")}}
              {{#each this}}
                <item>
                  {{{renderItem this}}}
                </item>
              {{/each}}
            {{else}}
              {{{renderNode @key this}}}
            {{/if}}
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
        return `<${key} ${attributes}>${content}</${key}>`;
      } else {
        return `<${key}>${value}</${key}>`;
      }
    });

    Handlebars.registerHelper('renderItem', (key, value) => {
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
            content += Handlebars.helpers.renderItem(subKey, subValue);
          }
        }
        return `<${key} ${attributes}>${content}</${key}>`;
      } else {
        return `<${key}>${value}</${key}>`;
      }
    });

    Handlebars.registerHelper('eq', (a, b) => {
      return a === b;
    });
  }

  generateFeed(jsonData: any, feedType: string): string {
    if (feedType === 'rss2') {
      return this.generateRssFeed(jsonData);
    } else if (feedType === 'atom') {
      return this.generateAtomFeed(jsonData);
    } else {
      throw new Error('Invalid feed type');
    }
  }

  private generateRssFeed(jsonData: any): string {
    return this.rssTemplate(jsonData);
  }

  private generateAtomFeed(jsonData: any): string {
    return this.atomTemplate(jsonData);
  }
}
