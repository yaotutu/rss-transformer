// src/common/common.module.ts
import { Module } from "@nestjs/common";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { WinstonService } from "./logger/winston.service";
import { PrismaService } from "./prisma/prisma.service";

@Module({
	providers: [ResponseInterceptor, WinstonService, PrismaService],
	exports: [ResponseInterceptor, WinstonService, PrismaService],
})
export class CommonModule {}
