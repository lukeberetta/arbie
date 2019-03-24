const winston = require("winston");
require("winston-papertrail").Papertrail;
import { LoggerInstance, LoggerOptions } from "winston";

export class WinstonLogger {

  private static _logger: LoggerInstance;

  public static GetLogger(): LoggerInstance {

    if (!this._logger) {

      let winstonPapertrail = new winston.transports.Papertrail({
        host: "logs3.papertrailapp.com",
        port: 24934,
        colorize: true
      });

      let winstonOptions: LoggerOptions = {
        level: "info",
        transports: [
          //new winston.transports.File({ filename: "error.log", level: "error" }),
          //new winston.transports.File({ filename: "~/combined.log" }),
          //new winston.transports.Console(),
          winstonPapertrail,
        ]
      };

      this._logger = new winston.Logger(winstonOptions);
    }

    return this._logger;
  }
}