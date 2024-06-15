// src/task/task.registry.ts
import { Injectable } from '@nestjs/common';
import { Task } from 'src/types';
import { SayHelloTask } from './tasks/sayHello.task';
import { GenericLlmTask } from './tasks/generic.llm.task';

@Injectable()
export class TaskRegistry {
  private tasks: Map<string, Task> = new Map();

  constructor(
    private sayHelloTask: SayHelloTask,
    private genericLlmTask: GenericLlmTask,
  ) {
    this.tasks.set('sayHello', this.sayHelloTask);
    this.tasks.set('genericLlm', this.genericLlmTask);
  }

  getTask(taskName: string): Task | null {
    return this.tasks.get(taskName) || null;
  }
}
