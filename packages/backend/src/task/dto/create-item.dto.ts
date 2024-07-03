import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty } from "class-validator";

export type TaskType = "UPDATE_ITEM" | "TRANSLATE";

export class CreateItemDto {
	@ApiProperty({
		description: "任务ID，对应rss_source表的ID",
		example: 2,
	})
	@IsNotEmpty()
	readonly rssSourceID: number;

	@ApiProperty({
		description: "任务类型",
		example: "UPDATE_ITEM",
		enum: ["UPDATE_ITEM", "TRANSLATE"],
	})
	@IsNotEmpty()
	@IsIn(["UPDATE_ITEM", "TRANSLATE"])
	readonly taskType: TaskType;
}
