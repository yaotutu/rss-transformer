// @ts-nocheck
import { RssTransformed } from '@prisma/client';
import React from 'react';
import { SummarizeResult } from 'src/types';
import ReactDOMServer from 'react-dom/server';

type Props = {
  summarized: RssTransformed[];
  archiveType?: 'day' | 'count';
  count?: number;
};

const partitionArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (i % size === 0) {
      result.push([]);
    }
    result[result.length - 1].push(arr[i]);
  }
  return result;
};
const Sum = (props: Props) => {
  const { summarized, archiveType = 'count', count = 5 } = props;
  const rendertags = (tags: string[]) => {
    return tags ? tags.join(', ') : '';
  };

  const summarizedContent = () => {
    return summarized.map((rss) => {
      const { title, summary, tags } = JSON.parse(
        rss.itemTransformedInfo,
      ) as SummarizeResult;
      return (
        <div key={rss.id}>
          <h3>{title}</h3>
          <ul>
            <li>
              <strong>总结</strong>:{summary}
            </li>
            <li>
              <strong>标签</strong> : {rendertags(tags)}
            </li>
            <li>
              <a href={rss.itemUrl}>阅读更多</a>
            </li>
          </ul>
          <hr></hr>
        </div>
      );
    });
  };
  const splitSummarizeContent = partitionArray(summarizedContent(), count);

  const renderSummarizedContent = splitSummarizeContent.map((item) => {
    return ReactDOMServer.renderToStaticMarkup(item);
  });
  const cdataContent = renderSummarizedContent.map((item) => {
    return `<![CDATA[${item}]]>`;
  });

  return (
    <rss version="2.0">
      <channel>
        <title>My RSS Feed</title>
        <description>RSS 汇总</description>

        {cdataContent.map((item, index) => {
          return (
            <item key={index}>
              <title>Combined Summarized Content {index}</title>
              <description dangerouslySetInnerHTML={{ __html: item }} />
            </item>
          );
        })}
      </channel>
    </rss>
  );
};

export default Sum;
