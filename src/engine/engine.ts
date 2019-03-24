import * as fs from "fs";
import * as handlebars from "handlebars";
import { Logger } from "../common/logger";
import { Utils } from "../common/utils";
import { Currency } from "../enums/Currency";
import { Exchange } from "../enums/Exchange";
import { BitstampGateway } from "../gateways/bitstampGateway";
import { CexGateway } from "../gateways/cexGateway";
import { ForexGateway } from "../gateways/forexGateway";
import { LunoGatway } from "../gateways/lunoGateway";
import { IExchangeGateway } from "../interfaces/IExchangeGateway";
import { ILogger } from "../interfaces/ILogger";
import { Ticker } from "../interfaces/Ticker";
import { ArbitrageResult } from "../models/arbitrageResult";
import { ArbitrageRule } from "../models/arbitrageRule";
import { CurrencyPair } from "../models/currencyPair";
import { Market } from "../models/market";
import { MailService } from "../services/mailService";
import moment = require("moment");

export class Engine {

  private _logger: ILogger = new Logger("Engine");
  private _forexGateway: ForexGateway;
  private _mailService: MailService;
  private _networkFee: number;
  private _exchangeGatewayMap: Map<Exchange, IExchangeGateway>;
  private _arbResults: ArbitrageResult[];
  private _markets: Market[];
  private _arbRules: ArbitrageRule[];
  private _defaultArbThreshold = 7;

  constructor() {
    this._forexGateway = new ForexGateway();
    this._exchangeGatewayMap = new Map<Exchange, IExchangeGateway>();
    this._exchangeGatewayMap.set(Exchange.CEX, new CexGateway());
    this._exchangeGatewayMap.set(Exchange.Luno, new LunoGatway());
    this._exchangeGatewayMap.set(Exchange.Bitstamp, new BitstampGateway());
    this._mailService = new MailService();
    this._networkFee = 0.00025; // usually 0.0005 to 0.0001 BTC
    this._arbResults = [];
    this._arbRules = [
      new ArbitrageRule(1, Exchange.Luno, Exchange.Bitstamp),
      new ArbitrageRule(5, Exchange.Bitstamp, Exchange.Bitstamp),
    ];
  }

  private getTicker(market: Market, displayCurrency?: Currency): Ticker {
    let gw = this._exchangeGatewayMap.get(market.Exchange);
    if (!displayCurrency) {
      displayCurrency = market.CurrencyPair.Quote;
    }
    let fxRate = displayCurrency === market.CurrencyPair.Quote ? 1 : this._forexGateway.GetRate(market.CurrencyPair.Quote, displayCurrency);
    let ticker = gw.GetTicker(market.CurrencyPair.Quote);

    // If no ticker data available
    if (!ticker) {
      throw new Error(`No market data for ${market}`);
    }

    return {
      Ask: ticker.Ask * fxRate,
      Bid: ticker.Bid * fxRate,
      Last: ticker.Last * fxRate,
      High: ticker.High * fxRate,
      Low: ticker.Low * fxRate,
      Volume: ticker.Volume * fxRate,
    };

  }

  private calculateArbitrage(a: number, b: number): number {
    // Error handling
    if (!(a) || !(b)) {
      return 0;
    }
    let difference = b - a;
    let percentage = (difference / a) * 100;
    return percentage;
  }

  private logArbitrageResults(a: Market, b: Market): void {
    try {
      let buyPrice = this.getTicker(a, Currency.ZAR);
      let sellPrice = this.getTicker(b, Currency.ZAR);
      let quoteSymbolA = Utils.GetCurrencySymbol(a.CurrencyPair.Quote);
      let quoteSymbolB = Utils.GetCurrencySymbol(b.CurrencyPair.Quote);
      let arb = this.arbitrageResults(a, b);
      let exchangeNameA = Exchange[a.Exchange] === "Bitstamp" ? "Btsmp" : Exchange[a.Exchange];
      let exchangeNameB = Exchange[b.Exchange] === "Bitstamp" ? "Btsmp" : Exchange[b.Exchange];
      let message = `${exchangeNameA} (${quoteSymbolA}) -> ${exchangeNameB} (${quoteSymbolB}):       `
        + `\tR${Utils.Format(buyPrice.Last)}`
        + `\t->`
        + `\tR${Utils.Format(sellPrice.Last)}`
        + `\t\tMM: ${Utils.Format(arb.MakerMaker)}%`
        + `\tTT: ${Utils.Format(arb.TakerTaker)}%`;
      this._logger.info(message);
    } catch (e) {
      this._logger.error(e, "logArbitrageResults");
    }
  }

  private filterArbitrageResults(a: Market, b: Market): void {
    try {
      // Set % threshold
      let arb = this.arbitrageResults(a, b);

      let arbRule = this._arbRules.find(rule => rule.buyExchange === a.Exchange && rule.sellExchange === b.Exchange);

      if (!arbRule) {
        arbRule = this._arbRules.find(rule => rule.buyExchange === a.Exchange && !rule.sellExchange);
      }

      let threshold = arbRule ? arbRule.threshold : this._defaultArbThreshold;

      if (arb.MakerMaker > threshold) {
        this._arbResults.push(arb);
      }
    } catch (e) {
      this._logger.error(e, "filterArbitrageResults");
    }
  }

  private arbitrageResults(a: Market, b: Market): ArbitrageResult {

    let aTicker = this.getTicker(a, Currency.ZAR);
    let bTicker = this.getTicker(b, Currency.ZAR);
    let aGateway = this._exchangeGatewayMap.get(a.Exchange);
    let bGateway = this._exchangeGatewayMap.get(b.Exchange);
    let fees = a.Exchange === b.Exchange ? 0 : aGateway.WithdrawFeeBTC + bGateway.DepositFeeBTC + this._networkFee;

    return new ArbitrageResult(
      a,
      b,
      Utils.Round(aGateway.CreditCardFee, 2),
      Utils.Round(this.calculateArbitrage(aTicker.Ask, bTicker.Bid) - (aGateway.TakerFee + bGateway.TakerFee), 2), //TT
      Utils.Round(this.calculateArbitrage(aTicker.Ask, bTicker.Ask) - (aGateway.TakerFee + bGateway.MakerFee), 2), //TM
      Utils.Round(this.calculateArbitrage(aTicker.Bid, bTicker.Bid) - (aGateway.MakerFee + bGateway.TakerFee), 2), //MT
      Utils.Round(this.calculateArbitrage(aTicker.Bid, bTicker.Ask) - (aGateway.MakerFee + bGateway.MakerFee), 2), //MM
      Utils.Round((aTicker.Last * fees), 2),
      Utils.Round(this.getTicker(a).Last, 2),
      Utils.Round(this.getTicker(b).Last, 2)
    );

  }

  private sendMail(arr: ArbitrageResult[]): void {
    // Format data into hbs template
    const template = handlebars.compile(fs.readFileSync(__dirname + "/email.hbs").toString("utf-8"));
    const result = template({ arr: arr });
    this._mailService.arbieMail(result);
  }

  private arbitrageRoutine(): void {
    try {
      // Reset array
      this._arbResults = [];
      // Loop through all transactional directions
      for (let marketA of this._markets) {
        for (let marketB of this._markets) {
          if (marketA.MarketCode !== marketB.MarketCode) {
            this.logArbitrageResults(marketA, marketB);
            this.filterArbitrageResults(marketA, marketB);
          }
        }
      }

      // Log time
      this._logger.info(`Minutes since last email: ${moment().diff(this._mailService.EmailLastSent, "minutes")}`);
      // If arbitrage is found
      if (this._arbResults.length > 0) {
        // If no email sent in last 10min
        if (moment().diff(this._mailService.EmailLastSent, "minutes") > 10) {
          this.sendMail(this._arbResults);
        }
      }
    } catch (e) {
      this._logger.error(e, "arbitrageRoutine");
    }
  }

  public run() {
    // UX touch
    setTimeout(() => console.log("\x1b[34m%s\x1b[0m", "👾 Arbie is fetching data..."), 1000 * 2);
    // Add all arbitrage markets here
    this._markets = [
      new Market(Exchange.Luno, new CurrencyPair(Currency.BTC, Currency.ZAR)),
      new Market(Exchange.Bitstamp, new CurrencyPair(Currency.BTC, Currency.USD)),
      new Market(Exchange.Bitstamp, new CurrencyPair(Currency.BTC, Currency.EUR)),
      new Market(Exchange.CEX, new CurrencyPair(Currency.BTC, Currency.USD)),
      new Market(Exchange.CEX, new CurrencyPair(Currency.BTC, Currency.EUR)),
      // new Market(Exchange.CEX, new CurrencyPair(Currency.BTC, Currency.GBP)),
    ];
    // Arbie goes to work
    setInterval(() => this.arbitrageRoutine(), 1000 * 5);
  }

}
