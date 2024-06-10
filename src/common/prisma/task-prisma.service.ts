import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '@prisma/client';
import { WinstonService } from '../logger/winston.service';
import { BasePrismaService } from './base-prisma.service';
import { ErrorHandlingService } from '../error-handling/error-handling.service';

/**
 * Service for interacting with Prisma client to manage tasks.
 */
@Injectable()
export class TaskPrismaService extends BasePrismaService {
  /**
   * Initializes the TaskPrismaService with WinstonService.
   * @param {WinstonService} winstonService - The Winston logging service.
   */
  constructor(
    protected winstonService: WinstonService,
    protected errorHandlingService: ErrorHandlingService,
  ) {
    super(winstonService, errorHandlingService);
  }

  /**
   * Creates a new task.
   * @param {string} name - The name of the task.
   * @param {string} schedule - The schedule of the task.
   * @param {string} taskType - The type of the task.
   * @param {string} functionName - The function name of the task.
   * @param {any} taskData - The data of the task.
   * @param {number} rssSourceId - The ID of the RSS source.
   * @returns {Promise<Task>} - The created task.
   */
  async createTask(
    name: string,
    schedule: string,
    taskType: string,
    functionName: string,
    taskData: any,
    rssSourceId: number,
  ): Promise<Task> {
    try {
      const createdTask = await this.prisma.task.create({
        data: {
          name,
          schedule,
          taskType,
          functionName,
          taskData: JSON.stringify(taskData),
          rssSourceId,
        },
      });
      return createdTask;
    } catch (error) {
      this.handlePrismaError('TASK', 'Failed to create task.', error);
    }
  }

  /**
   * Retrieves all tasks.
   * @returns {Promise<Task[]>} - A list of all tasks.
   */
  async getAllTasks(): Promise<Task[]> {
    try {
      const tasks = await this.prisma.task.findMany();
      return tasks;
    } catch (error) {
      this.handlePrismaError('TASK', 'Failed to fetch all tasks.', error);
    }
  }

  /**
   * Deletes a task by ID.
   * @param {number} taskId - The ID of the task to delete.
   * @returns {Promise<Task>} - The deleted task.
   */
  async deleteTask(taskId: number): Promise<Task> {
    try {
      const deletedTask = await this.prisma.task.delete({
        where: { id: taskId },
      });
      return deletedTask;
    } catch (error) {
      this.handlePrismaError(
        'TASK',
        `Failed to delete task with ID ${taskId}.`,
        error,
      );
    }
  }

  /**
   * Retrieves a task by name.
   * @param {string} name - The name of the task.
   * @returns {Promise<Task | null>} - The retrieved task or null if not found.
   */
  async getTaskByName(name: string): Promise<Task | null> {
    try {
      const task = await this.prisma.task.findUnique({
        where: {
          name,
        },
      });
      return task;
    } catch (error) {
      this.handlePrismaError(
        'TASK',
        `Failed to retrieve task with name ${name}.`,
        error,
      );
    }
  }
}
