// prisma.service.ts
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaClient, RssSource } from "@prisma/client";
import { WinstonService } from "../logger/winston.service";
import { ApiResponse } from "../dto/common.dto";
import { ErrorCode } from "src/types";

@Injectable()
export class RssPrismaService {
	private readonly prisma: PrismaClient;

	constructor(private winstonService: WinstonService) {
		this.prisma = new PrismaClient();
	}

	async createRssSource(sourceInfo: {
		sourceUrl: string;
		rssID: string;
		sourceTitle?: string;
	}): Promise<string | ApiResponse<string>> {
		const { sourceUrl, sourceTitle, rssID } = sourceInfo;

		// Check if the RSS source already exists
		const existingRssSource = await this.prisma.rssSource.findUnique({
			where: { rssID },
		});

		if (existingRssSource) {
			return new ApiResponse(
				409,
				"Conflict",
				null,
				ErrorCode.RSS_SOURCE_EXISTS,
			);
		}

		// Create a new RSS source
		try {
			const data = {
				rssID,
				sourceUrl,
				sourceTitle: sourceTitle || sourceUrl, // Use sourceTitle if provided, otherwise use sourceUrl
			};
			await this.prisma.rssSource.create({
				data,
			});
			this.winstonService.info("DATABASE", JSON.stringify(data) || "");
			return "RSS source created successfully.";
		} catch (error) {
			this.winstonService.error(
				"DATABASE",
				"Failed to create RSS source.",
				error,
			);
			throw new InternalServerErrorException("Failed to create RSS source.");
		}
	}

	async getAllRssSources(): Promise<RssSource[] | ApiResponse<string>> {
		try {
			return await this.prisma.rssSource.findMany();
		} catch (error) {
			this.winstonService.error(
				"DATABASE",
				"Failed to fetch all RSS sources.",
				error,
			);
			throw new InternalServerErrorException(
				"Failed to fetch all RSS sources.",
			);
		}
	}
}
