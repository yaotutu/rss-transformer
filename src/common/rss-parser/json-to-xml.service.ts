import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';

@Injectable()
export class JsonToXmlService {
  constructor() {}

  convertToJsonToXml(jsonData: any, feedType: string): string {
    if (feedType === 'rss2') {
      return this.convertJsonToRss(jsonData);
    } else if (feedType === 'atom') {
      return this.convertJsonToAtom(jsonData);
    } else {
      throw new Error('Invalid feed type');
    }
  }

  /**
   * Convert JSON data to RSS XML.
   * @param jsonData - JSON data to be converted
   * @returns XML string
   */
  convertJsonToRss(jsonData: any): string {
    const rootName = Object.keys(jsonData)[0];
    const rootElement = create().ele(rootName);

    const renderRssXml = (parentElement: any, obj: any): void => {
      if (typeof obj !== 'object' || obj === null) {
        parentElement.txt(String(obj));
      } else if (Array.isArray(obj)) {
        for (const item of obj) {
          const itemElement = parentElement.ele(parentElement.node.nodeName);
          renderRssXml(itemElement, item);
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
            } else {
              const childElement = parentElement.ele(key);
              if (key === 'description' && typeof value === 'string') {
                childElement.dat(value); // 使用dat方法添加CDATA
              } else if (Array.isArray(value)) {
                value.forEach((item: any) => {
                  const arrayItemElement = parentElement.ele(key);
                  renderRssXml(arrayItemElement, item);
                });
              } else {
                renderRssXml(childElement, value);
              }
            }
          }
        }
      }
    };

    renderRssXml(rootElement, jsonData[rootName]);
    return rootElement.end({ prettyPrint: true });
  }

  /**
   * Convert JSON data to Atom XML.
   * @param jsonData - JSON data to be converted
   * @returns XML string
   */
  convertJsonToAtom(jsonData: any): string {
    const rootElement = create().ele('feed', {
      xmlns: 'http://www.w3.org/2005/Atom',
    });

    const renderAtomXml = (parentElement: any, obj: any): void => {
      if (typeof obj !== 'object' || obj === null) {
        parentElement.txt(String(obj));
      } else if (Array.isArray(obj)) {
        for (const item of obj) {
          const itemElement = parentElement.ele(parentElement.node.nodeName);
          renderAtomXml(itemElement, item);
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
            } else if (Array.isArray(value)) {
              value.forEach((item: any) => {
                const arrayItemElement = parentElement.ele(key);
                renderAtomXml(arrayItemElement, item);
              });
            } else {
              const childElement = parentElement.ele(key);
              if (
                (key === 'content' || key === 'summary') &&
                typeof value === 'string'
              ) {
                childElement.raw(`<![CDATA[${value}]]>`);
              } else {
                renderAtomXml(childElement, value);
              }
            }
          }
        }
      }
    };

    renderAtomXml(rootElement, jsonData);
    return rootElement.end({ prettyPrint: true });
  }
}
