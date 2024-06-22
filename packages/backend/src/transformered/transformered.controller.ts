import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TransformeredService } from './transformered.service';

@Controller('transformered')
export class TransformeredController {
  constructor(private readonly transformeredService: TransformeredService) {}
  @Get()
  getHello(): string {
    return 'Hello from TransformeredController';
  }

  @Get(':id')
  getTransformered(@Param('id', ParseIntPipe) id: number) {
    return this.transformeredService.generateTransformeredByTaskId(id);
  }
}
