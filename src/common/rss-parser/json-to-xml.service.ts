import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';

@Injectable()
export class JsonToXmlService {
  constructor() {}

  /**
   * Convert JSON data to XML based on the specified protocol.
   * @param jsonData - JSON data to be converted
   * @param protocol - Protocol type (rss or atom)
   * @returns XML string
   */
  convertToJsonToXml(jsonData: any, protocol: 'rss' | 'atom'): string {
    const rootName = protocol === 'rss' ? 'rss' : 'feed';
    const rootElement = create({ version: '1.0', encoding: 'UTF-8' }).ele(
      rootName,
    );

    this.renderXml(rootElement, jsonData, protocol);

    return rootElement.end({ prettyPrint: true });
  }

  /**
   * Render JSON data into XML elements based on the specified protocol.
   * @param parentElement - The parent XML element
   * @param obj - The JSON object to render
   * @param protocol - Protocol type (rss or atom)
   */
  private renderXml(
    parentElement: any,
    obj: any,
    protocol: 'rss' | 'atom',
  ): void {
    if (typeof obj !== 'object' || obj === null) {
      parentElement.txt(String(obj));
    } else if (Array.isArray(obj)) {
      for (const item of obj) {
        this.renderXml(parentElement, item, protocol);
      }
    } else {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];

          if (key === '$') {
            for (const attr in value) {
              if (value.hasOwnProperty(attr)) {
                parentElement.att(attr, value[attr]);
              }
            }
          } else if (key === '_') {
            parentElement.txt(value);
          } else if (key === 'link' && Array.isArray(value)) {
            for (const linkItem of value) {
              this.renderXml(parentElement, { link: linkItem }, protocol);
            }
          } else if (key === 'entry' && Array.isArray(value)) {
            for (const entryItem of value) {
              const entryElement = parentElement.ele('entry');
              this.renderXml(entryElement, entryItem, protocol);
            }
          } else {
            const childElement = parentElement.ele(key);
            if (
              (key === 'content' || key === 'summary') &&
              typeof value === 'string'
            ) {
              childElement.raw(`<![CDATA[${value}]]>`);
            } else {
              this.renderXml(childElement, value, protocol);
            }
          }
        }
      }
    }
  }
}
