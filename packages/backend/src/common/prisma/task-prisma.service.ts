// src/common/prisma/task-prisma.service.ts
import { Injectable } from '@nestjs/common';
import { Task as DbTask, PrismaClient } from '@prisma/client';
import { ErrorHandlingService } from '../exceptions/error-handling.service';
import { WinstonService } from '../logger/winston.service';
import { BasePrismaService } from './base-prisma.service';
import { Omit } from '@prisma/client/runtime/library';

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
    taskData: JSON,
    rssSourceId?: number,
    immediate?: boolean,
    rssSourceUrl?: string,
    rssItemTag?: string[],
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
          rssItemTag: JSON.stringify(rssItemTag),
        },
      });
    } catch (error) {
      this.handlePrismaError('创建任务失败', error);
    }
  }

  async updateTask(
    id: number,
    data: Omit<Partial<DbTask>, 'id'>,
  ): Promise<DbTask> {
    try {
      const res = await this.prisma.task.update({
        where: { id },
        data,
      });

      return res;
    } catch (error) {
      this.handlePrismaError('更新任务失败', error, true);
    }
  }

  // 删除任务
  async deleteTask(id: number): Promise<void> {
    try {
      await this.prisma.task.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError('删除任务失败', error, true);
    }
  }

  async getTaskByName(name: string): Promise<DbTask> {
    try {
      return await this.prisma.task.findUnique({ where: { name } });
    } catch (error) {
      this.handlePrismaError('Failed to get task by name', error);
    }
  }

  async getAllTasks(): Promise<DbTask[]> {
    try {
      return await this.prisma.task.findMany();
    } catch (error) {
      this.handlePrismaError('Failed to fetch all tasks', error);
    }
  }

  async updateTaskStatus(taskId: number, status: string): Promise<void> {
    try {
      await this.prisma.task.update({
        where: { id: taskId },
        data: { status },
      });
    } catch (error) {
      this.handlePrismaError('Failed to update task status', error);
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

  async getTaskById(taskId: number): Promise<DbTask> {
    try {
      return await this.prisma.task.findUnique({ where: { id: taskId } });
    } catch (error) {
      this.handlePrismaError('Failed to get task by id', error, false);
    }
  }
}
