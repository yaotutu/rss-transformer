import {
  Injectable,
  Logger,
  OnModuleInit,
  NotFoundException,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Task } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { TaskPrismaService } from '../common/prisma/task-prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskService implements OnModuleInit {
  private readonly logger = new Logger(TaskService.name);
  private currentTasks = new Map<number, string>();

  constructor(
    private taskPrismaService: TaskPrismaService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    try {
      await this.syncTasks();
    } catch (error) {
      this.handleError('Failed to synchronize tasks on module init', error);
    }
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { name, schedule, taskType, functionName, taskData, rssSourceId } =
      createTaskDto;
    try {
      // Check if task with the same name already exists
      const existingTask = await this.taskPrismaService.getTaskByName(name);
      if (existingTask) {
        throw new Error(`Task with name '${name}' already exists.`);
      }

      const task = await this.taskPrismaService.createTask(
        name,
        schedule,
        taskType,
        functionName,
        taskData,
        rssSourceId,
      );
      this.addCronJob(task);
      return task;
    } catch (error) {
      this.handleError('Failed to create task', error);
    }
  }

  async sayHello(): Promise<string> {
    const message = 'Hello, World!';
    this.logger.log(message);
    return message;
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      return await this.taskPrismaService.getAllTasks();
    } catch (error) {
      this.handleError('Failed to fetch all tasks', error);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async syncTasks() {
    try {
      const tasks = await this.getAllTasks();

      // Remove jobs that are no longer in the database
      for (const [taskId, jobName] of this.currentTasks) {
        if (!tasks.some((task) => task.id === taskId)) {
          if (this.schedulerRegistry.doesExist('cron', jobName)) {
            this.schedulerRegistry.deleteCronJob(jobName);
            this.logger.warn(`Removed job ${jobName}`);
          }
          this.currentTasks.delete(taskId);
        }
      }

      // Add new tasks
      for (const task of tasks) {
        if (!this.currentTasks.has(task.id)) {
          this.addCronJob(task);
        }
      }
    } catch (error) {
      this.handleError('Failed to synchronize tasks', error);
    }
  }

  private addCronJob(task: Task) {
    const jobName = `task_${task.id}`;

    // 检查是否存在相同名称的 Cron Job
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.logger.warn(`Job ${jobName} already exists, skipping addition.`);
      return;
    }

    const jobCallback = async () => {
      this.logger.debug(`Running task: ${task.name}`);
      const data = JSON.parse(task.taskData);
      const method = (this as any)[task.functionName];
      if (typeof method === 'function') {
        try {
          await method.call(this, data);
        } catch (error) {
          this.handleError(`Failed to execute task: ${task.name}`, error);
        }
      } else {
        this.logger.error(`Unknown function: ${task.functionName}`);
      }
    };

    const cronJob = new CronJob(
      task.schedule,
      jobCallback,
      null,
      false,
      'Asia/Shanghai',
    );

    this.schedulerRegistry.addCronJob(jobName, cronJob);
    cronJob.start();
    this.currentTasks.set(task.id, jobName);
    this.logger.warn(`Job ${jobName} added with schedule ${task.schedule}`);
  }

  private handleError(message: string, error: any) {
    this.logger.error(message, error);
    throw new Error(message);
  }
}
