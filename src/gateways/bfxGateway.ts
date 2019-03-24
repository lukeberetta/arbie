/*

import { Ticker } from "../interfaces/Ticker";
import WebSocket = require("ws");

export class BitfinexGateway {

  private _url: string;
  private _tickerData: Ticker[];

  constructor() {
    this._url = "wss://api.bitfinex.com/ws/2";
    this._tickerData = [];
  }

  public openSocket() {
    const w = new WebSocket(this._url);

    w.on("message", data => this.processData(data));

    const msg = JSON.stringify({
      event: "subscribe",
      channel: "fticker",
      symbol: "tBTCUSD",
    });

    w.on("open", () => w.send(msg));
  }

  private processData(data: any) {

    let res = JSON.parse(data);

    if (res[1] !== "hb" && Array.isArray(res[1])) {
      let tickerArray = res[1];

      let t: Ticker = {
        Bid: Number(tickerArray[0]),
        Ask: Number(tickerArray[2]),
        Last: Number(tickerArray[6]),
        Volume: Number(tickerArray[7]),
        High: Number(tickerArray[8]),
        Low: Number(tickerArray[9]),
      };

      this._tickerData.push(t);
    }

  }

  public getPrice(): number {
    let currentTicker = this._tickerData[this._tickerData.length - 1];
    return !currentTicker ? 0 : currentTicker.Last;
  }
}

*/
