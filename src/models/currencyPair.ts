import { Currency } from "../enums/Currency";

export class CurrencyPair {

  constructor(
    private _base: Currency, 
    private _quote: Currency) {
    }

  public get Base(): Currency {
    return this._base;
  }

  public get Quote(): Currency {
    return this._quote;
  }

  public get PairCode(): string {
    return `${Currency[this._base]}_${Currency[this._quote]}`.toLowerCase();
  }
 
  public toString(): string {
    return `${Currency[this._base]}/${Currency[this._quote]}`;
  }

}