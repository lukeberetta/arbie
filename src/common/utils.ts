import { Currency } from "../enums/Currency";

export class Utils {

  public static Round(val: number, precision: number): number {
    let c = Math.pow(10, precision);
    return Math.round(val * c) / c;
  }

  public static Format(val: number): string {
    return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  public static IsNullOrWhiteSpace(val: string): boolean {
    const whitespace = " \n\r\t\s";
    return !val || whitespace.indexOf(val) > -1;
  }

  public static GetCurrencySymbol(currency: Currency): string {
    switch (currency) {
      case Currency.USD:
        return "$";
      case Currency.ZAR:
        return "R";
      case Currency.EUR:
        return "€";
      case Currency.GBP:
        return "£";
      default:
        return "";
    }
  }

}