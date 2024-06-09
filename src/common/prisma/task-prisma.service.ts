import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient, Task } from '@prisma/client';
import { WinstonService } from '../logger/winston.service';

@Injectable()
export class TaskPrismaService {
  private readonly prisma: PrismaClient;

  constructor(private winstonService: WinstonService) {
    this.prisma = new PrismaClient();
  }

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
      this.handlePrismaError(error, 'Failed to create task.');
    }
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      const tasks = await this.prisma.task.findMany();
      return tasks;
    } catch (error) {
      this.handlePrismaError(error, 'Failed to fetch all tasks.');
    }
  }

  async deleteTask(taskId: number): Promise<Task> {
    try {
      const deletedTask = await this.prisma.task.delete({
        where: { id: taskId },
      });
      return deletedTask;
    } catch (error) {
      this.handlePrismaError(error, `Failed to delete task with ID ${taskId}.`);
    }
  }

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
        error,
        `Failed to retrieve task with name ${name}.`,
      );
    }
  }

  private handlePrismaError(error: any, message: string): void {
    this.winstonService.error('DATABASE', message, error); // Log the error using WinstonService
    console.error(message, error);
    throw new InternalServerErrorException(message);
  }
}
