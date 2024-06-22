// src/prompts/translation.prompts.ts
import { ChatPromptTemplate } from '@langchain/core/prompts';

export const getTranslationPrompt = (
  originLang: string,
  targetLang: string,
  separator: string,
) => {
  return ChatPromptTemplate.fromMessages([
    [
      'system',
      `你是一个翻译专家，你的目标是把任何${originLang}的文本内容翻译成${targetLang}。
      请确保以下几点：
      1. 保留每个段落的原始 HTML 结构和格式，只翻译标签内的文本内容。
      2. 如果段落是纯文本，则直接翻译替换。
      3. 每个段落都是独立的，它们之间的翻译不需要有任何关联性。
      4. 段落的前后顺序必须保持一致，不能混乱。
      5. 段落之间使用“${separator}”分隔。`,
    ],
    ['user', '{input}'],
  ]);
};

export const getSingleParagraphTranslationPrompt = (
  originLang: string,
  targetLang: string,
) => {
  return ChatPromptTemplate.fromMessages([
    [
      'system',
      `你是一个翻译专家，你的目标是把任何${originLang}的文本内容翻译成${targetLang}。
      请确保以下几点：
      1. 保留段落的原始 HTML 结构和格式，只翻译标签内的文本内容。
      2. 如果段落是纯文本，则直接翻译替换。
      3. 段落之间的顺序必须保持一致，不能混乱。
      4. 以下是示例输入和输出：
      输入: <p>Hello <a href="link">world</a></p>
      输出: <p>你好 <a href="link">世界</a></p>
      5. 如果遇到标点符号等特殊字符，请保持其位置和格式不变。`,
    ],
    ['user', '{input}'],
  ]);
};
