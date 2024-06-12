// src/task/task.registry.ts
import { Injectable } from '@nestjs/common';
import { Task } from 'src/types';
import { SayHelloTask } from './tasks/sayHello.task';

@Injectable()
export class TaskRegistry {
  private tasks: Map<string, Task> = new Map();

  constructor(private sayHelloTask: SayHelloTask) {
    this.tasks.set('sayHello', this.sayHelloTask);
  }

  getTask(taskName: string): Task | null {
    return this.tasks.get(taskName) || null;
  }
}
