import { Global, Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { LogType } from 'src/types';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Global()
@Injectable()
export class WinstonService {
  private readonly logger: winston.Logger;
  private readonly logsDir: string;

  constructor() {
    const rootDir = process.cwd();
    this.logsDir = path.join(rootDir, 'logs');

    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir);
    }

    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({
              format: () => this.getTimestamp(),
            }),
            winston.format.colorize(),
            winston.format.printf((info) => {
              return `${info.timestamp} [${info.level}] ${info.message}`;
            }),
          ),
        }),
        new DailyRotateFile({
          filename: path.join(this.logsDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp({
              format: () => this.getTimestamp(),
            }),
            winston.format.json(),
            winston.format.printf((info) => {
              return `${info.timestamp} [${info.level}] ${info.message}`;
            }),
          ),
          maxFiles: '10d',
          maxSize: '20m',
        }),
        new DailyRotateFile({
          filename: path.join(this.logsDir, 'combined-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          format: winston.format.combine(
            winston.format.timestamp({
              format: () => this.getTimestamp(),
            }),
            winston.format.json(),
            winston.format.printf((info) => {
              return `${info.timestamp} [${info.level}] ${info.message}`;
            }),
          ),
          maxFiles: '7d',
          maxSize: '20m',
        }),
      ],
    });
  }

  private getTimestamp() {
    // Get current date in Beijing time
    const date = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Shanghai',
    });
    return date;
  }

  log(type: LogType, message: string = '') {
    this.logger.info(`[${type}] ${message}`);
  }

  error(type: LogType, message: string, error?: Error | string) {
    let logMessage = `${message}`;
    if (error instanceof Error) {
      logMessage = `${message} - ${error.message}`;
      this.logger.error(`[${type}] ${logMessage} ${error.stack}`);
    } else if (typeof error === 'string') {
      logMessage = `${message} - ${error}`;
      this.logger.error(`[${type}] ${logMessage}`);
    } else {
      this.logger.error(`[${type}] ${logMessage}`);
    }
  }

  warn(type: LogType, message = '', error?: Error | string) {
    let logMessage = `${message}`;
    if (error instanceof Error) {
      logMessage = `${message} - ${error.message}`;
      this.logger.warn(`[${type}] ${logMessage} ${error.stack}`);
    } else if (typeof error === 'string') {
      logMessage = `${message} - ${error}`;
      this.logger.warn(`[${type}] ${logMessage}`);
    } else {
      this.logger.warn(`[${type}] ${logMessage}`);
    }
  }

  debug(type: LogType, message = '', error?: Error | string) {
    let logMessage = `${message}`;
    if (error instanceof Error) {
      logMessage = `${message} - ${error.message}`;
      this.logger.debug(`[${type}] ${logMessage} ${error.stack}`);
    } else if (typeof error === 'string') {
      logMessage = `${message} - ${error}`;
      this.logger.debug(`[${type}] ${logMessage}`);
    } else {
      this.logger.debug(`[${type}] ${logMessage}`);
    }
  }

  verbose(type: LogType, message = '', error?: Error | string) {
    let logMessage = `${message}`;
    if (error instanceof Error) {
      logMessage = `${message} - ${error.message}`;
      this.logger.verbose(`[${type}] ${logMessage} ${error.stack}`);
    } else if (typeof error === 'string') {
      logMessage = `${message} - ${error}`;
      this.logger.verbose(`[${type}] ${logMessage}`);
    } else {
      this.logger.verbose(`[${type}] ${logMessage}`);
    }
  }
  info(type: LogType, message: string) {
    this.logger.info(`[${type}] ${message}`);
  }
}
