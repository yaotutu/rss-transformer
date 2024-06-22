export class ApiResponse<T> {
  constructor(
    public statusCode: number,
    public message: string,
    public data: T | null,
    public error?: string,
    public meta?: { isRss?: boolean }, // 添加 meta 字段，用于存储额外的元数据
  ) {}
}

export class ApiException extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
