import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResponse } from "../dto/common.dto"; // 假设这里放置了通用的 DTO

@Injectable()
export class ResponseInterceptor<T>
	implements NestInterceptor<T, ApiResponse<T>>
{
	intercept(
		_context: ExecutionContext,
		next: CallHandler<T>,
	): Observable<ApiResponse<T>> {
		return next.handle().pipe(
			map((data) => {
				if (data instanceof ApiResponse) {
					return data; // 如果已经是 ApiResponse 格式，直接返回
				}
				return new ApiResponse(200, "Success", data);
			}),
		);
	}
}
