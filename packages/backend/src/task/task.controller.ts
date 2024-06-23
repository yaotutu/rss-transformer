import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskService } from './task.service';
import { LangchainService } from 'src/common/langchain/langchain.service';

@Controller('task')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly langchainService: LangchainService,
  ) {}
  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return await this.taskService.createTask(createTaskDto);
  }

  @Post('hello')
  async sayHello() {
    // return await this.taskService.sayHello();
  }

  @Get()
  getHello(): any {
    // return this.langchainService.translateParagraphs();
  }
}