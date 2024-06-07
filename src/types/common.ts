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

export type LogType = "RSS_PARSER" | "HTTP" | "DATABASE" | "GENERAL" | "ADD_RSS_SOURCE"
