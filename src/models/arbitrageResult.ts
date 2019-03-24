import { Utils } from "../common/utils";
import { Exchange } from "../enums/Exchange";
import { Market } from "./market";

export class ArbitrageResult {

  constructor(
    public BuyMarket: Market,
    public SellMarket: Market,
    public CreditFee: number,
    public TakerTaker: number,
    public TakerMaker: number,
    public MakerTaker: number,
    public MakerMaker: number,
    public StaticFees: number,
    public MarketAPrice: number,
    public MarketBPrice: number
  ) { }

  public get BuyExchange(): string {
    return Exchange[this.BuyMarket.Exchange];
  }

  public get SellExchange(): string {
    return Exchange[this.SellMarket.Exchange];
  }

  public get BuySymbol(): string {
    return Utils.GetCurrencySymbol(this.BuyMarket.CurrencyPair.Quote);
  }

  public get SellSymbol(): string {
    return Utils.GetCurrencySymbol(this.SellMarket.CurrencyPair.Quote);
  }

  public get MakerMakerWithCreditFee(): number {
    return Utils.Round(this.MakerMaker - this.CreditFee, 2);
  }

  public get MakerTakerWithCreditFee(): number {
    return Utils.Round(this.MakerTaker - this.CreditFee, 2);
  }

  public get TakerMakerWithCreditFee(): number {
    return Utils.Round(this.TakerMaker - this.CreditFee, 2);
  }

  public get TakerTakerWithCreditFee(): number {
    return Utils.Round(this.TakerTaker - this.CreditFee, 2);
  }

  public get FormatAPrice(): string {
    return Utils.Format(this.MarketAPrice);
  }

  public get FormatBPrice(): string {
    return Utils.Format(this.MarketBPrice);
  }

}