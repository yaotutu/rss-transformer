import { Injectable } from '@nestjs/common';
import serialize from 'dom-serializer';
import { AnyNode, Node } from 'domhandler';
import { DomHandler, Parser } from 'htmlparser2';
import { WinstonService } from 'src/common/logger/winston.service';

@Injectable()
export class HtmlSplitterService {
  constructor(private readonly winstonService: WinstonService) {}

  /**
   * Parses the HTML content and returns the root node of the DOM tree.
   *
   * @param htmlContent - The HTML content to parse.
   * @returns An array of nodes representing the DOM tree.
   */
  parseHtmlContent(htmlContent: string): Node[] {
    const handler = new DomHandler();
    const parser = new Parser(handler);

    try {
      parser.write(htmlContent);
      parser.end();
    } catch (error) {
      console.error('Error parsing HTML content:', error);
      return [];
    }

    return handler.dom;
  }

  /**
   * Splits the HTML content into chunks of specified maximum length.
   *
   * @param htmlContent - The HTML content to split.
   * @param maxLength - The maximum length of each chunk (default: 1000).
   * @returns An array of strings representing the split HTML content.
   */
  splitHtmlContent(htmlContent: string, maxLength = 1000): string[] {
    const elements = this.parseHtmlContent(htmlContent);
    const chunks: string[] = [];
    let currentChunkLength = 0;
    let currentChunk: AnyNode[] = [];

    elements.forEach((element) => {
      const serializedElement = serialize(element as AnyNode);
      const elementLength = serializedElement.length;

      if (currentChunkLength + elementLength > maxLength) {
        if (currentChunk.length > 0) {
          chunks.push(this.serializeNodes(currentChunk));
          currentChunk = [];
          currentChunkLength = 0;
        }

        if (elementLength <= maxLength) {
          currentChunk.push(element as AnyNode);
          currentChunkLength = elementLength;
        } else {
          chunks.push(serializedElement); // 直接截断，不再递归遍历子元素
        }
      } else {
        currentChunk.push(element as AnyNode);
        currentChunkLength += elementLength;
      }
    });

    if (currentChunk.length > 0) {
      chunks.push(this.serializeNodes(currentChunk));
    }
    this.winstonService.info('HTML_SPLIT', JSON.stringify(chunks));
    return chunks.filter((chunk) => chunk.trim() !== ''); // 过滤掉空白字符和空标签
  }

  /**
   * Serializes an array of nodes into a string.
   *
   * @param nodes - The nodes to serialize.
   * @returns The serialized string representation of the nodes.
   */
  private serializeNodes(nodes: AnyNode[]): string {
    return nodes.map((node) => serialize(node)).join('');
  }
}
