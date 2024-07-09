// src/task/tasks/sayHello.task.ts
import { Injectable } from '@nestjs/common';
import { RssPrismaService } from 'src/common/prisma/rss-prisma.service';
import { Task } from 'src/types';

@Injectable()
export class SayHelloTask implements Task {
  constructor(private rssPrismaService: RssPrismaService) {}

  async execute(rssSourceId: number): Promise<void> {}
}
