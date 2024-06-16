import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as xml2js from 'xml2js';
import { ErrorHandlingService } from '../error-handling/error-handling.service';
import { LogType } from 'src/types';

@Injectable()
export class RssParserService {
  private readonly parser: xml2js.Parser;

  constructor(private readonly errorHandlingService: ErrorHandlingService) {
    this.parser = new xml2js.Parser({ explicitArray: false, trim: true });
  }

  /**
   * Parses the RSS feed from the provided URL.
   * @param {string} url - The URL of the RSS feed.
   * @returns {Promise<any>} - A promise that resolves with the parsed feed data.
   */
  async parseUrl(url: string): Promise<{
    feedInfo: any;
    items: any[];
    rssVsersion: string;
  }> {
    try {
      const xml = await this.fetchRssData(url); // Fetch the RSS feed data
      const parsedXml = await this.parseXml(xml); // Parse the XML data

      const rssVsersion = this.detectFeedType(parsedXml); // Detect the feed type
      const feedInfo = this.extractFeedInfo(parsedXml, rssVsersion); // Extract feed information
      const items = this.extractItems(parsedXml, rssVsersion); // Extract items

      return { feedInfo, items, rssVsersion };
    } catch (error) {
      this.handleRssParsingError(
        'An error occurred while parsing the RSS feed',
        error,
      );
      return null; // Return null or a default value in case of error
    }
  }

  /**
   * Fetches the RSS feed data from the provided URL.
   * @param {string} url - The URL of the RSS feed.
   * @returns {Promise<string>} - A promise that resolves with the fetched XML data.
   */
  private async fetchRssData(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed. Status: ${response.status}`);
    }
    return response.text(); // Return the fetched XML data
  }

  /**
   * Parses the XML data using the XML parser.
   * @param {string} xml - The XML data to parse.
   * @returns {Promise<any>} - A promise that resolves with the parsed XML object.
   */
  private async parseXml(xml: string): Promise<any> {
    try {
      return await this.parser.parseStringPromise(xml);
    } catch (error) {
      throw new Error(`Failed to parse XML: ${error.message}`);
    }
  }

  /**
   * Detects the type of the feed (RSS 2.0 or Atom).
   * @param {any} parsedXml - The parsed XML object.
   * @returns {string} - The type of the feed ('rss2', 'atom', or 'unknown').
   */
  private detectFeedType(parsedXml: any): string {
    if (parsedXml.rss) {
      return 'rss2';
    } else if (parsedXml.feed) {
      return 'atom';
    } else {
      return 'unknown';
    }
  }

  /**
   * Extracts the feed information and items based on the feed type.
   * @param {any} parsedXml - The parsed XML object.
   * @param {string} feedType - The type of the feed ('rss2' or 'atom').
   * @returns {any} - The extracted feed information or items.
   */
  private extractFeedInfo(parsedXml: any, feedType: string): any {
    if (feedType === 'rss2') {
      return this.getFeedInfoRss2(parsedXml);
    } else if (feedType === 'atom') {
      return this.getFeedInfoAtom(parsedXml);
    } else {
      return null;
    }
  }

  /**
   * Extracts the feed items based on the feed type.
   * @param {any} parsedXml - The parsed XML object.
   * @param {string} feedType - The type of the feed ('rss2' or 'atom').
   * @returns {any[]} - The list of extracted items.
   */
  private extractItems(parsedXml: any, feedType: string): any[] {
    if (feedType === 'rss2') {
      return this.getItemsRss2(parsedXml);
    } else if (feedType === 'atom') {
      return this.getItemsAtom(parsedXml);
    } else {
      return [];
    }
  }

  /**
   * Extracts the feed information for RSS 2.0 format.
   * @param {any} parsedXml - The parsed XML object.
   * @returns {any} - The feed information.
   */
  private getFeedInfoRss2(parsedXml: any): any {
    const channel = parsedXml.rss.channel;
    return {
      title: channel.title,
      link: channel.link,
      description: channel.description,
      lastBuildDate: channel.lastBuildDate,
    };
  }

  /**
   * Extracts the items for RSS 2.0 format.
   * @param {any} parsedXml - The parsed XML object.
   * @returns {any[]} - The list of items.
   */
  private getItemsRss2(parsedXml: any): any[] {
    const channel = parsedXml.rss.channel;
    return (Array.isArray(channel.item) ? channel.item : [channel.item]).map(
      (item) => ({
        title: item.title,
        link: item.link,
        description: item.description,
        pubDate: item.pubDate,
        id: item.guid._ || item.guid,
      }),
    );
  }

  /**
   * Extracts the feed information for Atom format.
   * @param {any} parsedXml - The parsed XML object.
   * @returns {any} - The feed information.
   */
  private getFeedInfoAtom(parsedXml: any): any {
    const deepFeed = JSON.parse(JSON.stringify(parsedXml));
    delete deepFeed.feed.entry;
    return deepFeed;
  }

  /**
   * Extracts the items for Atom format.
   * @param {any} parsedXml - The parsed XML object.
   * @returns {any[]} - The list of items.
   */
  private getItemsAtom(parsedXml: any): any[] {
    const feed = parsedXml.feed;
    return Array.isArray(feed.entry) ? feed.entry : [feed.entry];
  }

  /**
   * Handles RSS parsing errors and logs them.
   * @param {string} message - The error message.
   * @param {any} error - The error object.
   */
  protected handleRssParsingError(message: string, error: any): void {
    const source: LogType = 'RSS_PARSER_TO_XML'; // Set the appropriate log type
    this.errorHandlingService.handleError(source, message, error);
  }
}
