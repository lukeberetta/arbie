import { Logger } from "../common/logger";
import { Utils } from "../common/utils";
import { Currency } from "../enums/Currency";
import { IExchangeGateway } from "../interfaces/IExchangeGateway";
import { ILogger } from "../interfaces/ILogger";
import { Ticker } from "../interfaces/Ticker";
import request = require("request");

export class CexGateway implements IExchangeGateway {

  private _logger: ILogger = new Logger("CexGateway");
  private _urls: Map<Currency, string>;
  private _tickerData: Map<Currency, Ticker>;

  public get CreditCardFee(): number {
    return 3.5;
  }

  public get TakerFee(): number {
    return 0.25;
  }

  public get MakerFee(): number {
    return 0.16;
  }

  public get WithdrawFeeBTC(): number {
    return 0.001;
  }

  public get DepositFeeBTC(): number {
    return 0;
  }

  constructor() {
    this._tickerData = new Map<Currency, Ticker>();
    this._urls = new Map<Currency, string>();
    this._urls.set(Currency.USD, "https://cex.io/api/ticker/BTC/USD");
    this._urls.set(Currency.EUR, "https://cex.io/api/ticker/BTC/EUR");
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
        Low: Number(tickerData.low),
        High: Number(tickerData.high),
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
