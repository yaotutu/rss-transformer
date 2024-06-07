// prisma.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService {
	private readonly prisma: PrismaClient;

	constructor() {
		this.prisma = new PrismaClient();
	}

	async createRssSource(sourceInfo: {
		sourceUrl: string;
		rssID: string;
		sourceTitle?: string;
	}): Promise<string> {
		const { sourceUrl, sourceTitle, rssID } = sourceInfo;
		// Check if the RSS source already exists
		const existingRssSource = await this.prisma.rssSource.findUnique({
			where: { rssID },
		});

		if (existingRssSource) {
			return "RSS source already exists.";
		}

		// Create a new RSS source
		try {
			await this.prisma.rssSource.create({
				data: {
					rssID,
					sourceUrl,
					sourceTitle: sourceTitle || sourceUrl, // Use sourceTitle if provided, otherwise use sourceUrl
				},
			});
			return "RSS source created successfully.";
		} catch (error) {
			console.error("Error creating RSS source:", error);
			return "Failed to create RSS source.";
		}
	}
}
