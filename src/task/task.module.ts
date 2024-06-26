import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { CommonModule } from 'src/common/common.module';
import { TaskService } from './task.service';
import { ErrorHandlingService } from 'src/common/error-handling/error-handling.service';
import { WinstonService } from 'src/common/logger/winston.service';
import { TaskPrismaService } from 'src/common/prisma/task-prisma.service';
import { TaskRegistry } from './task.registry';
import { SayHelloTask } from './tasks/sayHello.task';
import { GenericLlmTask } from './tasks/generic.llm.task';

@Module({
  imports: [CommonModule],
  providers: [
    TaskService,
    TaskRegistry,
    SayHelloTask,
    TaskPrismaService,
    WinstonService,
    ErrorHandlingService,
    GenericLlmTask,
  ],
  controllers: [TaskController],
})
export class TaskModule {}
