// src/task/task.service.ts

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Task as DbTask } from '@prisma/client';
import { CronJob } from 'cron';
import { ErrorHandlingService } from 'src/common/exceptions/error-handling.service';
import { ApiException } from '../common/dto/common.dto';
import { WinstonService } from '../common/logger/winston.service';
import { TaskPrismaService } from '../common/prisma/task-prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { taskMapping } from './task-mapping';
import { TaskRegistry } from './task.registry';

@Injectable()
export class TaskService implements OnModuleInit, OnModuleDestroy {
  private currentTasks = new Map<number, string>(); // Map to store current tasks and their job names
  private scheduledJobs = new Map<number, CronJob>(); // Map to store scheduled jobs
  private taskExecutionStates = new Map<number, boolean>(); // 任务ID与执行状态的映射
  constructor(
    private taskPrismaService: TaskPrismaService,
    private schedulerRegistry: SchedulerRegistry,
    private winstonService: WinstonService,
    private errorHandlingService: ErrorHandlingService,
    private taskRegistry: TaskRegistry,
  ) {}

  // Lifecycle hook, called once the module has been initialized
  async onModuleInit() {
    try {
      await this.syncTasks(); // Synchronize tasks on module initialization
    } catch (error) {
      this.handleError('Failed to synchronize tasks on module init', error);
    }
  }

  // Lifecycle hook, called once the module is being destroyed
  async onModuleDestroy() {
    await this.clearScheduledJobs(); // Clear all scheduled jobs when module is destroyed
  }

  // Endpoint to create a new task
  async createTask(createTaskDto: CreateTaskDto): Promise<DbTask | string> {
    const {
      name,
      schedule,
      taskType,
      rssSourceId,
      immediate = false,
      rssSourceUrl,
      rssItemTag,
    } = createTaskDto;
    if (!createTaskDto.taskData && !taskMapping[taskType]) {
      this.handleError('taskData or taskType is not provided', null, false);
      // return "taskData or taskType is not provided";
    }

    const taskData = createTaskDto.taskData || taskMapping[taskType].taskData;
    const functionName = taskMapping[taskType].functionName;

    try {
      // Check if task with the same name already exists
      const existingTask = await this.taskPrismaService.getTaskByName(name);
      if (existingTask) {
        throw new ApiException(400, `Task with name '${name}' already exists.`);
      }
      // TODO 增加校验 taskData的合法性
      if (!taskData) {
        throw new ApiException(400, `Task data not provided.`);
      }

      // Create the task in the database
      const task = await this.taskPrismaService.createTask(
        name,
        schedule,
        taskType,
        functionName,
        taskData,
        rssSourceId,
        immediate,
        rssSourceUrl,
        rssItemTag,
      );

      // Add the cron job for the task
      this.addCronJob(task, immediate);

      return task;
    } catch (error) {
      this.handleError('Failed to create task 😭', error);
      return error.message || 'Failed to create task';
    }
  }

  updateTask(id: number, updateTaskDto: CreateTaskDto) {
    if (isNaN(id)) {
      this.handleError('Failed to update task', 'id is not a number');
    }
    try {
      const data = {
        ...updateTaskDto,
        rssItemTag: JSON.stringify(updateTaskDto.rssItemTag),
        taskData: JSON.stringify(updateTaskDto.taskData),
      };
      return this.taskPrismaService.updateTask(id, data);
    } catch (error) {
      this.handleError('updateTask is faled', error);
    }
  }

  // 删除任务
  async deleteTask(id: number) {
    if (isNaN(id)) {
      this.handleError('Failed to delete task', 'id is not a number');
    }
    try {
      await this.removeScheduledJob(id); // Remove the scheduled job
      return this.taskPrismaService.deleteTask(id); // Delete the task from the database
    } catch (error) {
      this.handleError('Failed to delete task', error, true);
    }
  }

  // Endpoint to fetch all tasks
  async getAllTasks(): Promise<DbTask[]> {
    try {
      return await this.taskPrismaService.getAllTasks();
    } catch (error) {
      this.handleError('Failed to fetch all tasks', error);
      return [];
    }
  }

  // Method to synchronize tasks
  async syncTasks() {
    try {
      const tasks = await this.getAllTasks(); // Fetch all tasks from the database

      // Remove jobs that are no longer in the database
      for (const [taskId] of this.currentTasks) {
        if (!tasks.some((task) => task.id === taskId)) {
          await this.removeScheduledJob(taskId);
        }
      }

      // Add new or updated tasks
      for (const task of tasks) {
        if (!this.currentTasks.has(task.id)) {
          this.addCronJob(task, task.immediate);
        } else {
          const cronJob = this.scheduledJobs.get(task.id);
          if (cronJob && cronJob.cronTime.source !== task.schedule) {
            await this.updateScheduledJob(task);
          }
        }

        // Execute immediate task if needed
        if (task.immediate && task.status === 'pending') {
          this.executeImmediateTask(task);
        }
      }
    } catch (error) {
      this.handleError('Failed to synchronize tasks', error);
    }
  }

  // Method to add a cron job for a task
  private addCronJob(task: DbTask, immediate: boolean) {
    const { id } = task;
    const jobName = `task_${task.functionName}_${id}`;

    // Check if the job already exists
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.winstonService.warn(
        'TASK',
        `Job ${jobName} already exists, skipping addition.`,
      );
      return '任务已经存在了';
    }

    // Callback function for the cron job
    const jobCallback = async () => {
      this.winstonService.debug('TASK', `Running job: ${jobName},jobCallback`);
      this.winstonService.debug('TASK', `${this.taskExecutionStates.get(id)}`);
      if (this.taskExecutionStates.get(id)) {
        this.winstonService.warn(
          'TASK',
          `Task ${id}/${jobName} is already running, skipping.`,
        );
        return; // 如果任务已经在执行，跳过本次执行
      }
      this.taskExecutionStates.set(id, true); // 设置任务执行状态为正在执行
      this.winstonService.debug('TASK', `Running task: ${task.name}`);
      // Retrieve the task instance from registry and execute
      const taskInstance = this.taskRegistry.getTask(task.functionName);
      if (taskInstance) {
        try {
          await taskInstance.execute(id); // Execute task
        } catch (error) {
          this.handleError('Failed to execute task', error);
        } finally {
          this.taskExecutionStates.set(id, false); // Reset task execution state
        }
      } else {
        this.winstonService.error('TASK', `Unknown task: ${task.functionName}`);
      }
    };

    // Create a new cron job
    const cronJob = new CronJob(
      task.schedule,
      jobCallback,
      null,
      immediate, // Start immediately if 'immediate' is true
      'Asia/Shanghai', // Timezone
    );

    // Register the cron job and start it
    this.schedulerRegistry.addCronJob(jobName, cronJob);
    // if (!immediate) {
    //   cronJob.start();
    // }

    // Track the current tasks and scheduled jobs
    this.currentTasks.set(task.id, jobName);
    this.scheduledJobs.set(task.id, cronJob);

    // Log the addition of the cron job
    this.winstonService.info(
      'TASK',
      `Job ${jobName} added with schedule ${task.schedule}`,
    );

    // Execute immediate task if needed
    if (immediate) {
      jobCallback();
    }
  }

  // Method to execute an immediate task
  private async executeImmediateTask(task: DbTask) {
    const { id } = task;
    try {
      // Update task status to 'running'
      await this.taskPrismaService.updateTaskStatus(task.id, 'running');

      // Parse task data and execute task
      const taskInstance = this.taskRegistry.getTask(task.functionName);
      if (taskInstance) {
        await taskInstance.execute(id);
      }

      // Update task status to 'completed' and set immediate to false
      await this.taskPrismaService.updateTaskStatusAndImmediate(
        task.id,
        'completed',
        false,
      );
    } catch (error) {
      // Handle task execution failure
      await this.taskPrismaService.updateTaskStatus(task.id, 'failed');
      this.handleError('Failed to execute immediate task', error);
    }
  }

  // Method to remove a scheduled job
  private async removeScheduledJob(taskId: number) {
    const jobName = this.currentTasks.get(taskId);
    if (jobName) {
      this.schedulerRegistry.deleteCronJob(jobName);
      this.winstonService.warn('TASK', `Removed job ${jobName}`);
      this.currentTasks.delete(taskId);
      this.scheduledJobs.delete(taskId);
    }
  }

  // Method to update a scheduled job
  private async updateScheduledJob(task: DbTask) {
    await this.removeScheduledJob(task.id);
    this.addCronJob(task, task.immediate);
  }

  // Method to clear all scheduled jobs
  private async clearScheduledJobs() {
    for (const cronJob of this.scheduledJobs.values()) {
      cronJob.stop(); // Stop each cron job
    }
    this.scheduledJobs.clear(); // Clear the map of scheduled jobs
  }

  // Method to output the current task list
  async outputCurrentTaskList() {
    this.winstonService.info('TASK', 'Current scheduled tasks:');
    this.currentTasks.forEach((jobName, taskId) => {
      const task = this.scheduledJobs.get(taskId);
      if (task) {
        this.winstonService.info(
          'TASK',
          `Job ${jobName} - Schedule: ${task.cronTime.source}`,
        );
      }
    });
  }
  // Error handling method
  private handleError(
    message: string,
    error: any,
    isUserFacing: boolean = false,
  ) {
    this.errorHandlingService.handleError('TASK', message, error, isUserFacing);
  }
}
