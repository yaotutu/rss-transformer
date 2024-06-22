import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateItemDto {
	@ApiProperty({
		description: "更新rss信息源对应的item,需要提供一个唯一ID",
		example: 2,
	})
	@IsNotEmpty()
	readonly id: number;
}
