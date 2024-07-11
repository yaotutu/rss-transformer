import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TransformedService } from './transformed.service';

@Controller('transformered')
export class TransformeredController {
  constructor(private readonly transformeredService: TransformedService) {}
  @Get()
  getHello(): string {
    return 'Hello from TransformeredController';
  }

  @Get(':id')
  getTransformered(@Param('id', ParseIntPipe) id: number) {
    return this.transformeredService.generateTransformedByTaskId(id);
  }

  // sum/id
  @Get('sum/:id')
  getSummarized(@Param('id', ParseIntPipe) id: number) {
    // return 'summarized by task id';
    return this.transformeredService.generateSummarizedByTaskId(id);
  }
}
