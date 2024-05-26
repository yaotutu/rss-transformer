import { IsNotEmpty, IsUrl, Max } from "class-validator";

export class CreateRssDto {
	@Max(10)
	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	@IsUrl()
	url: string;
}
