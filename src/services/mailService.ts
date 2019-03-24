import mailgunFactory = require("mailgun-js");
import { Logger } from "../common/logger";
import { ILogger } from "../interfaces/ILogger";
import moment = require("moment");
import { keys, recipientEmails } from "../_private";

const mailgun = new mailgunFactory({
  apiKey: keys.mailgun,
  domain: keys.mailgunDomain,
});

export class MailService {

  private _logger: ILogger = new Logger("MailService");
  private _emails: Array<string>;
  private _emailLastSent: moment.Moment;

  constructor() {
    this._emails = recipientEmails;
    this._emailLastSent = moment().subtract(1, "day");
  }

  public get EmailLastSent(): moment.Moment {
    return this._emailLastSent;
  }

  public arbieMail(arbitrageResults) {
    try {
      const data = {
        from: "Arbie the Bot <arbie@arbie.io>",
        to: this._emails.join(","),
        subject: "Arbitrage Opportunity",
        html: arbitrageResults,
      };

      mailgun.messages().send(data, (error, body) => {
        if (error) {
          this._logger.error(error);
        } else {
          this._logger.info("Email sent");
          this._emailLastSent = moment();
        }
      });
    } catch (e) {
      this._logger.error(e, "arbieMail");
    }
  }

}