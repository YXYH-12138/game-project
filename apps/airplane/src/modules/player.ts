import { Assets, Container, Sprite, type Application, type TickerCallback } from "pixi.js";

export interface IPlayerPlugin {
  id: string;
  install(player: Player): void;
  start(): void;
  stop(): void;
  destroy(): void;
}

export class Player {
  /** 应用 */
  app: Application;
  /** 玩家容器 */
  container: Container;

  /** 插件 */
  private plugins: Map<string, IPlayerPlugin>;

  private promise: Promise<void>;
  private resolve: () => void;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.plugins = new Map();
    app.stage.addChild(this.container);

    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });

    this.init();
  }

  use<T extends IPlayerPlugin>(plugin: T) {
    this.plugins.set(plugin.id, plugin);
    plugin.install(this);
    return this;
  }

  remove(id: string) {
    const { plugins } = this;
    const plugin = plugins.get(id);
    if (plugin) {
      plugin.destroy();
      plugins.delete(id);
    }
    return this;
  }

  async start() {
    await this.promise;
    this.plugins.forEach((plugin) => plugin.start());
  }

  stop() {
    this.plugins.forEach((plugin) => plugin.stop());
  }

  destroy() {
    this.plugins.forEach((plugin) => plugin.destroy());
    this.container.removeChildren();
  }

  addTicker<T>(fn: TickerCallback<T>) {
    this.app.ticker.add(fn);
  }

  removeTicker<T>(fn: TickerCallback<T>) {
    this.app.ticker.remove(fn);
  }

  private async init() {
    const { container, app } = this;
    // Load the bunny texture
    const texture = await Assets.load("https://pixijs.com/assets/bunny.png");

    const bunny = new Sprite(texture);
    bunny.width = 40;
    bunny.height = 40;
    container.addChild(bunny);

    // Move the container to the center
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

    // Center the bunny sprites in local container coordinates
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    this.resolve();
  }
}
