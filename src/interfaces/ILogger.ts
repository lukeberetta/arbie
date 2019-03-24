export interface ILogger {
  info(data: any);
  error(data: any, name?: string);
}