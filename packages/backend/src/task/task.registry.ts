// src/task/task.registry.ts
import { Injectable } from '@nestjs/common';
import { Task } from 'src/types';

import { SummarizeTask } from './tasks/summarize.service';
import { TranslateTask } from './tasks/translate.service';

@Injectable()
export class TaskRegistry {
  private tasks: Map<string, Task> = new Map();

  constructor(
    private translateTask: TranslateTask,
    private summarizeTask: SummarizeTask,
  ) {
    this.tasks.set('translateTask', this.translateTask);
    this.tasks.set('summarizeTask', this.summarizeTask);
  }

  getTask(taskName: string): Task | null {
    return this.tasks.get(taskName) || null;
  }
}
