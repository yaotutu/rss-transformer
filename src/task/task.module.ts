import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { CommonModule } from 'src/common/common.module';
import { TaskService } from './task.service';

@Module({
  imports: [CommonModule],
  providers: [TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
