import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  validateSync,
} from 'class-validator';
import { TranslateTaskDataDto } from './translate-task-data.dto';

@ValidatorConstraint({ name: 'DynamicTaskDataValidator', async: false })
export class DynamicTaskDataValidator implements ValidatorConstraintInterface {
  private errorMessages: string[] = [];

  validate(taskData: any, args: ValidationArguments) {
    const taskType = (args.object as any).taskType;
    this.errorMessages = []; // 重置错误消息

    if (taskType === 'TRANSLATE') {
      const translateTaskDataDto = new TranslateTaskDataDto();
      Object.assign(translateTaskDataDto, taskData);
      const errors = validateSync(translateTaskDataDto);
      if (errors.length > 0) {
        this.errorMessages = errors.map((err) =>
          Object.values(err.constraints).join(', '),
        );
        return false;
      }
      return true;
    }

    // Add other taskType cases and their corresponding DTOs

    this.errorMessages.push('Unsupported task type');
    return false; // Return false if taskType doesn't match any case
  }

  defaultMessage(args: ValidationArguments) {
    return this.errorMessages.join('; ');
  }
}
