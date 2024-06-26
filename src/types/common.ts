export type OmitMultiple<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type ErrorType =
  | 'RSS_PARSER_ERROR'
  | 'HTTP_ERROR'
  | 'DATABASE_ERROR'
  | 'GENERAL_ERROR'
  | 'INTERNAL_SERVER_ERROR';

export type InfoType =
  | 'RSS_PARSER_INFO'
  | 'HTTP_INFO'
  | 'DATABASE_INFO'
  | 'GENERAL_INFO';

export type LogType =
  | 'RSS_PARSER'
  | 'TASK'
  | 'HTTP'
  | 'DATABASE'
  | 'GENERAL'
  | 'ADD_RSS_SOURCE'
  | 'UPDATE_RSS_ITEMS'
  | 'MODEL_FACTORY'
  | 'MODEL_CONFIG'
  | 'PARSER_RSS_TO_JSON';

export type tsakType = 'TRANSLATE' | 'UPDATE_RSS_ITEMS';

export type taskStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'IN_PROGRESS'
  | 'NOT_STARTED';

export interface Task {
  execute(
    data: any,
    rssSourceId: number,
    rssSourceUrl: string,
    taskId: number,
  ): Promise<any>;
}
