import { Exchange } from "../enums/Exchange";
import { CurrencyPair } from "./currencyPair";

export class Market {

  constructor(
    private _exchange: Exchange, 
    private _currencyPair: CurrencyPair) {
  }

  public get Exchange(): Exchange {
    return this._exchange;
  }

  public get CurrencyPair(): CurrencyPair {
    return this._currencyPair;
  }

  public get MarketCode(): string {
    return `${Exchange[this._exchange]}_${this._currencyPair.PairCode}`.toLowerCase();
  }

  public toString(): string {
    return `${Exchange[this._exchange]}: ${this._currencyPair}`;
  }

}