// src/task/dto/is-cron-expression.validator.ts

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsCronExpression', async: false })
export class IsCronExpression implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    // Regular expression to validate cron expression format
    const cronExpressionRegex = /^((\*|[0-9,-]*) ?){5}$/;

    if (!cronExpressionRegex.test(value)) {
      return false;
    }

    // Further validation of cron expression
    const segments = value.split(' ');
    const validSegments = segments.every((segment) =>
      this.isValidSegment(segment),
    );

    return validSegments;
  }

  private isValidSegment(segment: string): boolean {
    // Validate each segment of the cron expression
    if (segment === '*' || segment === '?') {
      return true;
    }

    const rangeRegex = /^[0-9]+(-[0-9]+)?$/;
    const stepRegex = /^[0-9]+\/[0-9]+$/;
    const listRegex = /^[0-9,]+$/;

    if (rangeRegex.test(segment)) {
      const parts = segment.split('-').map(Number);
      return parts.every(Number.isInteger);
    } else if (stepRegex.test(segment)) {
      const parts = segment.split('/').map(Number);
      return parts.every(Number.isInteger);
    } else if (listRegex.test(segment)) {
      const parts = segment.split(',').map(Number);
      return parts.every(Number.isInteger);
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid cron expression.`;
  }
}
