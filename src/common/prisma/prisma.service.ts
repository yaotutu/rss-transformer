// prisma.service.ts

import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService {
	private readonly prisma: PrismaClient;

	constructor() {
		this.prisma = new PrismaClient();
	}

	async createRssSource(url: string, customName?: string): Promise<string> {
		// Check if the RSS source already exists
		const existingRssSource = await this.prisma.rssSource.findUnique({
			where: { sourceUrl: url },
		});

		if (existingRssSource) {
			return "RSS source already exists.";
		}

		// Create a new RSS source
		try {
			await this.prisma.rssSource.create({
				data: {
					sourceUrl: url,
					sourceTitle: customName || url, // Use customName if provided, otherwise use url
				},
			});
			return "RSS source created successfully.";
		} catch (error) {
			console.error("Error creating RSS source:", error);
			return "Failed to create RSS source.";
		}
	}
}
