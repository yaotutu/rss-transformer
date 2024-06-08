import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateItemDto {
	@ApiProperty({
		description: "任务ID，对应rss_source表的ID",
		example: 2,
	})
	@IsNotEmpty()
	readonly rssSourceID: number;
  readonly taskType: "UPDATE_ITEM"
}

