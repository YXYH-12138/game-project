import { initDevtools } from "@pixi/devtools";
import { Application, type ApplicationOptions, type TickerCallback } from "pixi.js";
import { EventBus } from "./event";
import { isFunction } from "es-toolkit";

export interface IGamePlugin {
  id?: string;
  install: (game: GameCore) => void;
  start?: () => void;
  stop?: () => void;
  destroy?: () => void;
}

export type PluginFunction = (game: GameCore) => IGamePlugin;

type Plugin = IGamePlugin | PluginFunction;

export class GameCore<Context extends Record<string, any> = Record<string, any>> {
  bus = new EventBus();
  /** 插件 */
  plugins: Map<string, IGamePlugin>;

  app = new Application();

  context: Context;

  private _isLoaded = false;
  private pluginIndex = 0;

  constructor() {
    this.context = Object.create(null);
    this.plugins = new Map();
    initDevtools({ app: this.app });
  }

  async init(options?: Partial<ApplicationOptions>) {
    this.bus.emit("preinit", { app: this.app, options });
    await this.app.init(options);
    this.bus.emit("postinit", { app: this.app });
  }

  inject(data: Record<string, any>) {
    Object.assign(this.context, data);
  }

  addTicker<T>(fn: TickerCallback<T>) {
    this.app.ticker.add(fn);
    return this;
  }

  removeTicker<T>(fn: TickerCallback<T>) {
    this.app.ticker.remove(fn);
    return this;
  }

  use(plugin: Plugin | Plugin[]) {
    const plugins = Array.isArray(plugin) ? plugin : [plugin];
    plugins.forEach((p) => {
      const config = isFunction(p) ? p(this) : p;
      this.plugins.set(config.id ?? this.pluginIndex.toString(), config);
      config.install(this);
      this.pluginIndex++;
    });

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
    this.app.start();
    if (!this._isLoaded) {
      this.plugins.forEach((plugin) => plugin.start?.());
      this._isLoaded = true;
    }

    this.bus.emit("start");
  }

  stop() {
    this.bus.emit("stop");
    this.plugins.forEach((plugin) => plugin.stop?.());
    this.app.stop();
  }

  destroy() {
    this.bus.emit("destroy");
    this.plugins.forEach((plugin) => plugin.destroy?.());
    this.app.destroy();
  }
}
