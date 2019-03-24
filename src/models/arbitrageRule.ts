import { Exchange } from "../enums/Exchange";

export class ArbitrageRule {

  constructor(
    public threshold: number,
    public buyExchange: Exchange,
    public sellExchange?: Exchange,
  ) {

  }

}