// src/common/common.module.ts
import { Module } from "@nestjs/common";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { WinstonService } from "./logger/winston.service";
import { RssPrismaService } from "./prisma/rss-prisma.service";

@Module({
	providers: [ResponseInterceptor, WinstonService, RssPrismaService],
	exports: [ResponseInterceptor, WinstonService, RssPrismaService],
})
export class CommonModule {}
