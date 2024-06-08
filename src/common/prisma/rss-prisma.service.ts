// prisma.service.ts
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaClient, RssSource } from "@prisma/client";
import { WinstonService } from "../logger/winston.service";
import { ApiResponse } from "../dto/common.dto";
import { ErrorCode } from "src/types";

/**
 * Service for interacting with Prisma client to manage RSS sources.
 */
@Injectable()
export class RssPrismaService {
	private readonly prisma: PrismaClient;

	/**
	 * Initializes the Prisma client and injects the WinstonService.
	 * @param {WinstonService} winstonService - The Winston logging service.
	 */
	constructor(private winstonService: WinstonService) {
		this.prisma = new PrismaClient();
	}

	/**
	 * Creates a new RSS source.
	 * @param {Object} sourceInfo - The information of the RSS source to be created.
	 * @param {string} sourceInfo.sourceUrl - The URL of the RSS source.
	 * @param {string} sourceInfo.rssID - The unique ID of the RSS source.
	 * @returns {Promise<RssSource | ApiResponse<string>>} - A success message or an ApiResponse with error code.
	 */
	async createRssSource(sourceInfo: {
		sourceUrl: string;
		rssID: string;
		customName: string;
	}): Promise<RssSource | ApiResponse<string>> {
		const { sourceUrl, rssID, customName } = sourceInfo;

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
				customName,
			};
			const res = await this.prisma.rssSource.create({
				data,
			});
			this.winstonService.info("DATABASE", JSON.stringify(data) || "");
			return res;
		} catch (error) {
			this.winstonService.error(
				"DATABASE",
				"Failed to create RSS source.",
				error,
			);
			throw new InternalServerErrorException("Failed to create RSS source.");
		}
	}

	/**
	 * Retrieves all RSS sources.
	 * @returns {Promise<RssSource[] | ApiResponse<string>>} - A list of RSS sources or an ApiResponse with error message.
	 */
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

	/**
	 * Updates an RSS source by its ID.
	 * @param id - The ID of the RSS source to update.
	 * @param updateFields - The fields to update in the RSS source.
	 * @returns {Promise<RssSource | ApiResponse<string>>} - The updated RSS source or an error response.
	 */
	async updateRssSource(
		id: number,
		updateFields: Partial<RssSource>,
	): Promise<RssSource | ApiResponse<string>> {
		try {
			// Check if the RSS source exists
			const existingRssSource = await this.prisma.rssSource.findUnique({
				where: { id },
			});

			if (!existingRssSource) {
				return new ApiResponse(
					404,
					"Not Found",
					null,
					ErrorCode.RSS_SOURCE_NOT_FOUND,
				);
			}

			// Perform the update
			const updatedRssSource = await this.prisma.rssSource.update({
				where: { id },
				data: updateFields,
			});

			this.winstonService.info(
				"DATABASE",
				`Updated RSS source with ID ${id}. Updated fields: ${JSON.stringify(
					updateFields,
				)}`,
			);

			return updatedRssSource;
		} catch (error) {
			this.winstonService.error(
				"DATABASE",
				"Failed to update RSS source.",
				error,
			);
			throw new InternalServerErrorException("Failed to update RSS source.");
		}
	}
}
