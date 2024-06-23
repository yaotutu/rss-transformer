// src/task/task.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { TaskPrismaService } from '../common/prisma/task-prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { WinstonService } from '../common/logger/winston.service';
import { ErrorHandlingService } from '../common/error-handling/error-handling.service';
import { LogType } from '../types/common';
import { TaskRegistry } from './task.registry';
import { ApiException } from '../common/dto/common.dto';
import { Task as DbTask } from '@prisma/client';
import { taskMapping } from './task-mapping';

@Injectable()
export class TaskService implements OnModuleInit, OnModuleDestroy {
  private currentTasks = new Map<number, string>(); // Map to store current tasks and their job names
  private scheduledJobs = new Map<number, CronJob>(); // Map to store scheduled jobs

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
      this.handleError(
        'TASK',
        'Failed to synchronize tasks on module init',
        error,
      );
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
      functionName,
      rssSourceId,
      immediate = false,
      rssSourceUrl,
    } = createTaskDto;
    const taskData =
      JSON.stringify(createTaskDto.taskData) || taskMapping[taskType];
    try {
      // Check if task with the same name already exists
      const existingTask = await this.taskPrismaService.getTaskByName(name);
      if (existingTask) {
        throw new ApiException(400, `Task with name '${name}' already exists.`);
      }
      return;

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
      );

      // Add the cron job for the task
      this.addCronJob(task, immediate);

      return task;
    } catch (error) {
      this.handleError('TASK', 'Failed to create task', error);
      return error.message || 'Failed to create task';
    }
  }

  // Endpoint to fetch all tasks
  async getAllTasks(): Promise<DbTask[]> {
    try {
      return await this.taskPrismaService.getAllTasks();
    } catch (error) {
      this.handleError('TASK', 'Failed to fetch all tasks', error);
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
      this.handleError('TASK', 'Failed to synchronize tasks', error);
    }
  }

  // Method to add a cron job for a task
  private addCronJob(task: DbTask, immediate: boolean) {
    const { rssSourceId, rssSourceUrl, id } = task;
    const jobName = `task_${task.id}`;

    // Check if the job already exists
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.winstonService.warn(
        'TASK',
        `Job ${jobName} already exists, skipping addition.`,
      );
      return;
    }

    // Callback function for the cron job
    const jobCallback = async () => {
      this.winstonService.debug('TASK', `Running task: ${task.name}`);
      const data = JSON.parse(task.taskData); // Parse task data

      // Retrieve the task instance from registry and execute
      const taskInstance = this.taskRegistry.getTask(task.functionName);
      if (taskInstance) {
        try {
          await taskInstance.execute(data, rssSourceId, rssSourceUrl, id); // Execute task
        } catch (error) {
          this.handleError('TASK', 'Failed to execute task', error);
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
    if (!immediate) {
      cronJob.start();
    }

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
    const { rssSourceId, rssSourceUrl, id } = task;
    try {
      // Update task status to 'running'
      await this.taskPrismaService.updateTaskStatus(task.id, 'running');

      // Parse task data and execute task
      const data = JSON.parse(task.taskData);
      const taskInstance = this.taskRegistry.getTask(task.functionName);
      if (taskInstance) {
        await taskInstance.execute(data, rssSourceId, rssSourceUrl, id);
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
      this.handleError('TASK', 'Failed to execute immediate task', error);
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

  // Error handling method
  private handleError(source: LogType, message: string, error: any) {
    this.errorHandlingService.handleError(source, message, error);
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
}
