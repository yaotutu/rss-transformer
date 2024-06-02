// src/common/common.module.ts
import { Module } from "@nestjs/common";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { WinstonService } from "./logger/winston.service";

@Module({
	providers: [ResponseInterceptor, WinstonService],
	exports: [ResponseInterceptor, WinstonService],
})
export class CommonModule {}
