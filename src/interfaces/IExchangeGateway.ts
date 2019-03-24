import { Currency } from "../enums/Currency";
import { Ticker } from "./Ticker";

export interface IExchangeGateway {

  CreditCardFee: number;
  MakerFee: number;
  TakerFee: number;
  WithdrawFeeBTC: number;
  DepositFeeBTC: number;
  GetTicker(currency: Currency): Ticker;

}