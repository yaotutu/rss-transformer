// src/rss/types.ts
export interface CreateRssSourceData {
	sourceUrl: string;
	sourceTitle: string;
}

export interface CreateArticleData {
	rssSourceId: number;
	articleUrl: string;
	title: string;
	content?: string;
	translatedContent?: string;
	summary?: string;
	translatedSummary?: string;
	contentAudio?: string;
	summaryAudio?: string;
	translatedAudio?: string;
	status?: string;
	errorMessage?: string;
	updated?: Date;
}

export interface CreateRssSourceWithArticleData {
	rssSourceData: CreateRssSourceData;
	articleData: CreateArticleData;
}
