import { Logger } from "../common/logger";
import { Utils } from "../common/utils";
import { Currency } from "../enums/Currency";
import { ILogger } from "../interfaces/ILogger";
import { keys } from "../_private";
import request from "request";

export class ForexGateway {

  private _logger: ILogger = new Logger("ForexGateway");
  private _url: string;
  private _forexData: Map<Currency, number>;
  private _fxCommission: number;

  constructor() {
    this._url = `http://data.fixer.io/api/latest?access_key=${keys.forexGateway}&symbols=USD,EUR,ZAR&format=1`;
    this._forexData = new Map<Currency, number>();
    this._fxCommission = 1.5;
    this.callApi();
    setInterval(() => this.callApi(), 1000 * 60 * 60);
  }

  private callApi() {
    try {
      request.get(this._url, (error, response, body) => {
        this.processData(body);
      });
    } catch (e) {
      this._logger.error(e, "callApi");
    }
  }

  private processData(data) {
    try {
      // Error handling
      if (Utils.IsNullOrWhiteSpace(data)) {
        return;
      }
      let res = JSON.parse(data);
      Object.keys(res.rates).forEach((k, i) => {
        let currency: Currency = Currency[k.toUpperCase()];
        this._forexData.set(currency, Number(res.rates[k]));
      });
    } catch (e) {
      this._logger.error(e, "processData");
    }
  }

  public GetRate(base: Currency, quote: Currency = Currency.ZAR): number {
    // Return rate with bank commission
    let fxCommission = 1 + (this._fxCommission / 100);
    let result = 0;
    // Correct base currency
    if (this._forexData.has(base)) {
      if (quote === Currency.EUR) {
        result = this._forexData.get(base) * fxCommission;
      } else if (this._forexData.has(quote)) {
        result = (this._forexData.get(quote) / this._forexData.get(base)) * fxCommission;
      }
    }
    return result;
  }

}