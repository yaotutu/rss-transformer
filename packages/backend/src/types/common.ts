export type OmitMultiple<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

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
  | 'HTML_SPLIT'
  | 'PARSER_RSS_TO_JSON'
  | 'SUMMARIZE_TASK';

export type tsakType = 'TRANSLATE' | 'UPDATE_RSS_ITEMS';

export type taskStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'IN_PROGRESS'
  | 'NOT_STARTED';

export interface Task {
  execute(taskId: number): Promise<any>;
}

export type SummarizeResult = {
  title: string;
  summary: string;
  key_points: string[];
  tags: string[];
  status: 'success' | 'error' | 'timeout';
  date: string;
};
