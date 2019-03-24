import { Engine } from "./engine/engine";

export class App {

  public static main() {
    console.log("\x1b[36m%s\x1b[0m", "App running...");
    const engine = new Engine();
    engine.run();
  }
}

App.main();
