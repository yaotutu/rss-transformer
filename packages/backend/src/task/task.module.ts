import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ErrorHandlingService } from 'src/common/exceptions/error-handling.service';
import { WinstonService } from 'src/common/logger/winston.service';
import { TaskPrismaService } from 'src/common/prisma/task-prisma.service';
import { TaskController } from './task.controller';
import { TaskRegistry } from './task.registry';
import { TaskService } from './task.service';
import { TranslateTask } from './tasks/translate.service';

@Module({
  imports: [CommonModule],
  providers: [
    TaskService,
    TaskRegistry,
    TaskPrismaService,
    WinstonService,
    ErrorHandlingService,
    TranslateTask,
  ],
  controllers: [TaskController],
})
export class TaskModule {}
