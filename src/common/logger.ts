import { LoggerInstance } from "winston";
import { ILogger } from "../interfaces/ILogger";
import { WinstonLogger } from "./WinstonLogger";

export class Logger implements ILogger {

  private _paperTrails: LoggerInstance;

  constructor(private _name: string) {
    this._paperTrails = WinstonLogger.GetLogger();
  }

  public info(data: any) {
    let message = `${this._name}: ${data}`;
    if (data instanceof Object) {
      message = `${this._name}: ${JSON.stringify(data)}`;
    }
    console.log(message);
    this._paperTrails.info(message);
  }

  public error(data: any, name?: string) {
    let p = name ? `${name}:` : "";
    let message = `${this._name}:${p} ${data}`;
    if (data instanceof Error) {
      message = `${this._name}:${p} ${data.message} \n ${data.stack}`;
    } else if (data instanceof Object) {
      message = `${this._name}:${p} ${JSON.stringify(data)}`;
    }
    console.log(message);
    this._paperTrails.error(message);
  }

}