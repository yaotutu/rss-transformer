import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';
import { TransformeredController } from './transformed.controller';
import { TransformedService } from './transformed.service';

@Module({
  imports: [CommonModule],
  controllers: [TransformeredController],
  providers: [TransformedService],
})
export class TransformeredModule {}
