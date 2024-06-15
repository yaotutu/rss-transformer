import { Module } from '@nestjs/common';
import { TransformeredController } from './transformered.controller';
import { TransformeredService } from './transformered.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [TransformeredController],
  providers: [TransformeredService],
})
export class TransformeredModule {}
