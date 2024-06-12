// src/task/tasks/sayHello.task.ts
import { Injectable } from '@nestjs/common';
import { Task } from 'src/types';

@Injectable()
export class SayHelloTask implements Task {
  async execute(data: any): Promise<void> {
    return new Promise<void>((resolve) => {
      console.log(`Hello, ${data.param1}!`);
      if (data.param2) {
        console.log(`You have provided param2: ${data.param2}`);
      }
      resolve();
    });
  }
}
