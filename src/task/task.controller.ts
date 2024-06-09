import { Body, Controller, Post } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}
  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return await this.taskService.createTask(createTaskDto);
  }

  @Post('hello')
  async sayHello() {
    return await this.taskService.sayHello();
  }
  // @Post()
  // create(@Body() createItemDto: CreateItemDto) {
  // 	const { rssSourceID, taskType } = createItemDto;
  // 	switch (taskType) {
  // 		case "UPDATE_ITEM":
  // 			return this.rssService.updateItemByRssSourceID(rssSourceID);
  // 		default:
  // 			return "暂不支持的任务类型";
  // 	}
  // }
}
