import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RssModule } from "./rss/rss.module";
import { CoreRssProcessorModule } from "./core-rss-processor/core-rss-processor.module";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { CommonModule } from "./common/common.module";
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
	imports: [RssModule, CoreRssProcessorModule, CommonModule],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseInterceptor,
		},
		// {
		// 	provide: APP_FILTER,
		// 	useClass: HttpExceptionFilter,
		// },
	],
})
export class AppModule {}
