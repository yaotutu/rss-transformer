// src/common/prisma/task-prisma.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { BasePrismaService } from './base-prisma.service';
import { Task as DbTask, PrismaClient, RssItem } from '@prisma/client';
import { WinstonService } from '../logger/winston.service';
import { ErrorHandlingService } from '../error-handling/error-handling.service';

@Injectable()
export class TaskPrismaService extends BasePrismaService {
  constructor(
    prisma: PrismaClient,
    winstonService: WinstonService,
    errorHandlingService: ErrorHandlingService,
  ) {
    super(prisma, winstonService, errorHandlingService);
  }

  async createTask(
    name: string,
    schedule: string,
    taskType: string,
    functionName: string,
    taskData: any,
    rssSourceId?: number,
    immediate?: boolean,
    rssSourceUrl?: string,
  ): Promise<DbTask> {
    try {
      return await this.prisma.task.create({
        data: {
          name,
          schedule,
          taskType,
          functionName,
          taskData: JSON.stringify(taskData),
          rssSourceId,
          immediate,
          rssSourceUrl,
        },
      });
    } catch (error) {
      this.handlePrismaError('DATABASE', '创建任务失败', error);
    }
  }

  async getTaskByName(name: string): Promise<DbTask> {
    try {
      return await this.prisma.task.findUnique({ where: { name } });
    } catch (error) {
      this.handlePrismaError('DATABASE', 'Failed to get task by name', error);
    }
  }

  async getAllTasks(): Promise<DbTask[]> {
    try {
      return await this.prisma.task.findMany();
    } catch (error) {
      this.handlePrismaError('DATABASE', 'Failed to fetch all tasks', error);
    }
  }

  async updateTaskStatus(taskId: number, status: string): Promise<void> {
    try {
      await this.prisma.task.update({
        where: { id: taskId },
        data: { status },
      });
    } catch (error) {
      this.handlePrismaError('DATABASE', 'Failed to update task status', error);
    }
  }

  async updateTaskStatusAndImmediate(
    taskId: number,
    status: string,
    immediate: boolean,
  ): Promise<void> {
    try {
      await this.prisma.task.update({
        where: { id: taskId },
        data: { status, immediate },
      });
    } catch (error) {
      this.handlePrismaError(
        'DATABASE',
        'Failed to update task status and immediate flag',
        error,
      );
    }
  }

  // 查询 RssTransformed 表中的记录
  // 根据 taskId 查询 RssTransformed 表中的记录
  async getTransformedItemsByTaskId(
    taskId: number,
  ): Promise<{ uniqueArticleId: string }[]> {
    return this.prisma.rssTransformed.findMany({
      where: { taskId },
    });
  }
}
