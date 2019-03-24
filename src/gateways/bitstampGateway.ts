import { Logger } from "../common/logger";
import { Utils } from "../common/utils";
import { Currency } from "../enums/Currency";
import { IExchangeGateway } from "../interfaces/IExchangeGateway";
import { ILogger } from "../interfaces/ILogger";
import { Ticker } from "../interfaces/Ticker";
import request = require("request");

export class BitstampGateway implements IExchangeGateway {

  private _logger: ILogger = new Logger("BitstampGateway");
  private _tickerData: Map<Currency, Ticker>;
  private _urls: Map<Currency, string>;

  public get CreditCardFee(): number {
    return 5;
  }

  public get TakerFee(): number {
    return 0.25;
  }

  public get MakerFee(): number {
    return 0.25;
  }

  public get WithdrawFeeBTC(): number {
    return 0;
  }

  public get DepositFeeBTC(): number {
    return 0;
  }

  constructor() {
    this._tickerData = new Map<Currency, Ticker>();
    this._urls = new Map<Currency, string>();
    this._urls.set(Currency.USD, "https://www.bitstamp.net/api/ticker/");
    this._urls.set(Currency.EUR, "https://www.bitstamp.net/api/v2/ticker/btceur/");
    this.callApi();
    setInterval(() => this.callApi(), 1000 * 3);
  }

  private callApi(): void {
    try {
      for (let [currency, url] of this._urls) {
        request.get(url, (error, response, body) => {
          this.processData(body, currency);
        });
      }
    } catch (e) {
      this._logger.error(e, "callApi");
    }
  }

  private processData(data, currency: Currency): void {
    try {

      if (Utils.IsNullOrWhiteSpace(data)) {
        return;
      }

      let tickerData = JSON.parse(data);

      let ticker = {
        Bid: Number(tickerData.bid),
        Ask: Number(tickerData.ask),
        Last: Number(tickerData.last),
        Volume: Number(tickerData.volume),
      };

      this._tickerData.set(currency, ticker);

    } catch (e) {
      this._logger.error(e, "processData");
    }
  }

  public GetTicker(currency: Currency): Ticker {
    return this._tickerData.get(currency);
  }

}