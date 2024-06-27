import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskService } from './task.service';
import { LangchainService } from 'src/common/langchain/langchain.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('task')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly langchainService: LangchainService,
  ) {}
  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(createTaskDto);
  }

  @Post('hello')
  async sayHello() {
    // return await this.taskService.sayHello();
  }

  @Get()
  @ApiOperation({ summary: '获取所有任务' })
  getAllTasks() {
    return this.taskService.getAllTasks();
  }
}
