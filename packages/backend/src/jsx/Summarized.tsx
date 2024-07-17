// @ts-nocheck
import { RssTransformed } from '@prisma/client';
import React from 'react';
import { SummarizeResult } from 'src/types';
import ReactDOMServer from 'react-dom/server';

type Props = {
  summarized: RssTransformed[];
};

const Sum = (props: Props) => {
  const { summarized } = props;
  const rendertags = (tags: string[]) => {
    return tags ? tags.join(', ') : '';
  };

  const renderSummarizedContent = () => {
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

  const summarizedContent = ReactDOMServer.renderToStaticMarkup(
    renderSummarizedContent(),
  );
  const cdataContent = `<![CDATA[${summarizedContent}]]>`;

  return (
    <rss version="2.0">
      <channel>
        <title>My RSS Feed</title>
        <description>RSS 汇总</description>
        <item>
          <title>Combined Summarized Content</title>
          <description dangerouslySetInnerHTML={{ __html: cdataContent }} />
        </item>
      </channel>
    </rss>
  );
};

export default Sum;
