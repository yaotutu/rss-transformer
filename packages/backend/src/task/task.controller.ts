import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { CreateTaskDto } from "./dto/create-task.dto";
import { TaskService } from "./task.service";
import { ApiOperation } from "@nestjs/swagger";

@Controller("task")
export class TaskController {
	constructor(private readonly taskService: TaskService) {}
	@Post()
	createTask(@Body() createTaskDto: CreateTaskDto) {
		return this.taskService.createTask(createTaskDto);
	}

	@Put(":id")
	updateTask(@Param("id") id: string, @Body() updateTaskDto: CreateTaskDto) {
		const numericId = Number(id);
		return this.taskService.updateTask(numericId, updateTaskDto);
	}

	@Get()
	@ApiOperation({ summary: "获取所有任务" })
	getAllTasks() {
		return this.taskService.getAllTasks();
	}
}
