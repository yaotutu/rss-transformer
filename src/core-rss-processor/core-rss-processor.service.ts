import { Injectable } from "@nestjs/common";

@Injectable()
export class CoreRssProcessorService {
	getHello(): string {
		return "Hello World!";
	}
}
