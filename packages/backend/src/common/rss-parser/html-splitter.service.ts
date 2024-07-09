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
   * @returns An array of ChunkInfo objects representing the split HTML content.
   */
  splitHtmlContent(htmlContent: string, maxLength = 1000): ChunkInfo[] {
    const elements = this.parseHtmlContent(htmlContent);
    const chunks: ChunkInfo[] = [];
    let currentChunkLength = 0;
    let currentChunk: AnyNode[] = [];
    const contextStack: AnyNode[][] = [[]];

    const traverseNodes = (nodes: AnyNode[], level = 0) => {
      nodes.forEach((node) => {
        const serializedNode = serialize(node);
        const nodeLength = serializedNode.length;

        if (currentChunkLength + nodeLength > maxLength) {
          if (currentChunk.length > 0) {
            chunks.push({
              htmlContent: this.serializeNodes(currentChunk),
              level: level,
            });
            contextStack.push(currentChunk); // 保存上下文
            currentChunk = [];
            currentChunkLength = 0;
          }

          if (nodeLength <= maxLength || isPunctuationOrWhitespace(node)) {
            currentChunk.push(node);
            currentChunkLength = nodeLength;
          } else {
            // 递归切割较大的节点
            if (
              (node as any).childNodes &&
              (node as any).childNodes.length > 0
            ) {
              traverseNodes((node as any).childNodes, level + 1);
            } else {
              chunks.push({
                htmlContent: serializedNode, // 无法递归切割时，直接添加整个节点
                level: level,
              });
            }
          }
        } else {
          currentChunk.push(node);
          currentChunkLength += nodeLength;
        }
      });
    };

    traverseNodes(elements as AnyNode[]);

    if (currentChunk.length > 0) {
      chunks.push({
        htmlContent: this.serializeNodes(currentChunk),
        level: 0,
      });
      contextStack.push(currentChunk); // 保存最后的上下文
    }

    this.winstonService.info('HTML_SPLIT', JSON.stringify(chunks));
    return chunks.filter((chunk) => chunk.htmlContent.trim() !== ''); // 过滤掉空白字符和空标签
  }

  /**
   * Combines processed chunks back into a single HTML string.
   *
   * @param processedChunks - The processed chunks of HTML content.
   * @returns The combined HTML content as a single string.
   */
  combineChunks(processedChunks: ChunkInfo[]): string {
    return processedChunks.map((chunk) => chunk.htmlContent).join('');
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

// 定义 ChunkInfo 接口，用于保存切割后的块信息
interface ChunkInfo {
  htmlContent: string;
  level: number;
}

/**
 * Determines if a node is a punctuation or whitespace character.
 * 用于判断一个节点是否为标点符号或空白字符
 *
 * @param node - The node to check.
 * @returns Whether the node is a punctuation or whitespace character.
 */
function isPunctuationOrWhitespace(node: AnyNode): boolean {
  const textNode = node as unknown as { data?: string };
  if (textNode.data) {
    const text = textNode.data;
    return /^[\s\n()「」[\]{}.,;:!?'"‘’“”\-—]+$/.test(text);
  }
  return false;
}
