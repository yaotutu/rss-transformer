// src/common/utils/text-utils.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class TextUtilsService {
  /**
   * Splits the input text into groups of sentences based on language-specific delimiters and a maximum length.
   * @param text The input text to be split.
   * @param maxLength The maximum length of each group of sentences.
   * @returns An array of strings, where each string is a group of sentences.
   */
  splitTextByLanguage(text: string, maxLength: number = 2000): string[] {
    if (text.length <= maxLength) return [text];
    const delimiter = this.isChinese(text) ? '。' : '.';
    const sentences = this.splitText(text, delimiter);
    const groups = this.assembleSentences(sentences, maxLength);

    return groups;
  }

  /**
   * Determines if the input text is primarily Chinese or English.
   * @param text The input text to be checked.
   * @returns True if the text is primarily Chinese, otherwise false.
   */
  private isChinese(text: string): boolean {
    const chineseCharRegex = /[\u4e00-\u9fa5]/;
    const englishCharRegex = /[a-zA-Z]/;

    let chineseCount = 0;
    let englishCount = 0;

    for (const char of text) {
      if (chineseCharRegex.test(char)) {
        chineseCount++;
      } else if (englishCharRegex.test(char)) {
        englishCount++;
      }
    }

    return chineseCount > englishCount;
  }

  /**
   * Splits the text into sentences based on the specified delimiter.
   * If the delimiter is a period (.), it ensures not to split within numeric values.
   * @param text The input text to be split.
   * @param delimiter The delimiter used to split the text (either a period or a Chinese full stop).
   * @returns An array of sentences.
   */
  private splitText(text: string, delimiter: string): string[] {
    const sentences: string[] = [];
    let currentSentence = '';

    // Helper function to determine if a character at a given index is a valid delimiter
    const isDelimiter = (char: string, index: number): boolean => {
      if (char !== delimiter) return false;
      if (index > 0 && index < text.length - 1) {
        const prevChar = text[index - 1];
        const nextChar = text[index + 1];
        if (/\d/.test(prevChar) && /\d/.test(nextChar)) {
          return false;
        }
      }
      return true;
    };

    // Loop through each character in the text and split based on the delimiter
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (isDelimiter(char, i)) {
        currentSentence += char;
        sentences.push(currentSentence.trim());
        currentSentence = '';
      } else {
        currentSentence += char;
      }
    }

    // Add any remaining text as the last sentence
    if (currentSentence.trim() !== '') {
      sentences.push(currentSentence.trim());
    }

    return sentences;
  }

  /**
   * Assembles sentences into groups based on the maximum length constraint.
   * @param sentences An array of sentences to be grouped.
   * @param maxLength The maximum length of each group of sentences.
   * @returns An array of strings, where each string is a group of sentences.
   */
  private assembleSentences(sentences: string[], maxLength: number): string[] {
    const totalLength = sentences.reduce(
      (sum, sentence) => sum + sentence.length,
      0,
    );
    const numGroups = Math.ceil(totalLength / maxLength);
    const targetLength = Math.ceil(totalLength / numGroups);

    const groups: string[] = [];
    let currentGroup: string = '';
    let currentLength = 0;

    for (const sentence of sentences) {
      const sentenceLength = sentence.length;

      // If adding the sentence exceeds targetLength, start a new group
      if (currentLength + sentenceLength + 1 > targetLength) {
        groups.push(currentGroup.trim());
        currentGroup = '';
        currentLength = 0;
      }

      currentGroup += sentence + ' ';
      currentLength += sentenceLength + 1;
    }

    // Add any remaining sentences as the last group
    if (currentGroup.length > 0) {
      groups.push(currentGroup.trim());
    }

    return groups;
  }

  /**
   * Splits a long string into smaller chunks of the specified length.
   * @param str The input string to be chunked.
   * @param length The maximum length of each chunk.
   * @returns An array of string chunks.
   */
  private chunkString(str: string, length: number): string[] {
    const chunks = [];
    for (let i = 0; i < str.length; i += length) {
      chunks.push(str.slice(i, i + length));
    }
    return chunks;
  }
}
