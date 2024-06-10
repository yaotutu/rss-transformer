// src/task/task.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Task } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { TaskPrismaService } from '../common/prisma/task-prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { WinstonService } from '../common/logger/winston.service'; // WinstonService 的路径
import { ErrorHandlingService } from 'src/common/error-handling/error-handling.service';
import { LogType } from 'src/types/common';
import { ApiException } from 'src/common/dto/common.dto';

@Injectable()
export class TaskService implements OnModuleInit {
  private currentTasks = new Map<number, string>();

  constructor(
    private taskPrismaService: TaskPrismaService,
    private schedulerRegistry: SchedulerRegistry,
    private winstonService: WinstonService, // 注入 WinstonService
    private errorHandlingService: ErrorHandlingService, // 注入 ErrorHandlingService
  ) {}

  /**
   * Lifecycle hook, called once the module has been initialized.
   * Synchronizes tasks on module initialization.
   */
  async onModuleInit() {
    try {
      await this.syncTasks();
    } catch (error) {
      this.handleError(
        'TASK',
        'Failed to synchronize tasks on module init',
        error,
      );
    }
  }

  /**
   * Creates a new task.
   * @param {CreateTaskDto} createTaskDto - The DTO containing task information.
   * @returns {Promise<Task | string>} - The created task or an error message.
   */
  async createTask(createTaskDto: CreateTaskDto): Promise<Task | string> {
    const { name, schedule, taskType, functionName, taskData, rssSourceId } =
      createTaskDto;

    try {
      // Check if task with the same name already exists
      const existingTask = await this.taskPrismaService.getTaskByName(name);
      if (existingTask) {
        throw new ApiException(400, `Task with name '${name}' already exists.`);
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
      this.handleError('TASK', 'Failed to create task', error);
    }
  }

  /**
   * Retrieves all tasks.
   * @returns {Promise<Task[]>} - A list of all tasks.
   */
  async getAllTasks(): Promise<Task[]> {
    try {
      return await this.taskPrismaService.getAllTasks();
    } catch (error) {
      this.handleError('TASK', 'Failed to fetch all tasks', error);
    }
  }

  /**
   * Synchronizes tasks based on their schedule.
   */
  @Cron(CronExpression.EVERY_10_SECONDS)
  async syncTasks() {
    try {
      const tasks = await this.getAllTasks();

      // Remove jobs that are no longer in the database
      for (const [taskId, jobName] of this.currentTasks) {
        if (!tasks.some((task) => task.id === taskId)) {
          if (this.schedulerRegistry.doesExist('cron', jobName)) {
            this.schedulerRegistry.deleteCronJob(jobName);
            this.winstonService.warn('TASK', `Removed job ${jobName}`); // 记录警告日志
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
      this.handleError('TASK', 'Failed to synchronize tasks', error);
    }
  }

  /**
   * Adds a cron job for the given task.
   * @param {Task} task - The task for which to add the cron job.
   */
  private addCronJob(task: Task) {
    const jobName = `task_${task.id}`;

    // 检查是否存在相同名称的 Cron Job
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.winstonService.warn(
        'TASK',
        `Job ${jobName} already exists, skipping addition.`,
      ); // 记录警告日志
      return;
    }

    const jobCallback = async () => {
      this.winstonService.debug('TASK', `Running task: ${task.name}`); // 记录调试日志
      const data = JSON.parse(task.taskData);
      const method = (this as any)[task.functionName];
      if (typeof method === 'function') {
        try {
          await method.call(this, data);
        } catch (error) {
          this.handleError('TASK', 'Failed to execute task', error);
        }
      } else {
        this.winstonService.error(
          'TASK',
          `Unknown function: ${task.functionName}`,
        ); // 记录错误日志
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
    this.winstonService.info(
      'TASK',
      `Job ${jobName} added with schedule ${task.schedule}`,
    ); // 记录信息日志
  }

  sayHello() {
    console.log('Hello');
  }
  /**
   * Handles errors by delegating to the ErrorHandlingService.
   * @param {LogType} source - The source or type of the log (e.g., TASK, DATABASE).
   * @param {string} message - The error message.
   * @param {any} error - The error object.
   */
  private handleError(source: LogType, message: string, error: any) {
    this.errorHandlingService.handleError(source, message, error);
  }
}
