import { mapKeys } from "es-toolkit";
import { toLower } from "es-toolkit/compat";
import type { IPlayerPlugin, Player } from "./player";
import type { Ticker } from "pixi.js";

type KeytoMap = Record<"UP" | "DOWN" | "LEFT" | "RIGHT", any>;

export class MovementPlugin implements IPlayerPlugin {
  id = "movement";

  private _player: Player;
  private _speed: number;

  private _keys: Set<string>;
  private _keytoMap: KeytoMap;

  private cleanEvent: () => void | null;

  constructor(speed = 4, keytoMap?: KeytoMap) {
    this._speed = speed;
    this._keytoMap = keytoMap ?? { UP: "w", DOWN: "s", LEFT: "a", RIGHT: "d" };
    this._keys = new Set();
  }

  install(player: Player) {
    this._player = player;
  }

  start() {
    this.initEvent();
    this.loop();
  }

  stop() {
    this._player.removeTicker(this.update);
    this._keys.clear();
  }

  destroy() {
    this.cleanEvent?.();
    this.cleanEvent = null;
    this.stop();
  }

  private get keyMap() {
    return mapKeys(this._keytoMap, (value) => value);
  }

  private loop() {
    const { _player } = this;
    _player.addTicker(this.update);
  }

  private update = (ticker: Ticker) => {
    const { _player, _keys, _keytoMap } = this;
    let dx = 0,
      dy = 0;
    const dt = ticker.deltaTime;

    if (_keys.has(_keytoMap.UP)) dy -= 1;
    if (_keys.has(_keytoMap.DOWN)) dy += 1;
    if (_keys.has(_keytoMap.LEFT)) dx -= 1;
    if (_keys.has(_keytoMap.RIGHT)) dx += 1;

    if (dx !== 0 || dy !== 0) {
      // 计算向量长度（模长）。
      const len = Math.sqrt(dx * dx + dy * dy);
      // 归一化向量。
      _player.container.x += (dx / len) * this._speed * dt;
      _player.container.y += (dy / len) * this._speed * dt;
    }
  };

  private initEvent() {
    if (this.cleanEvent) return;

    const keydownHandle = (e: KeyboardEvent) => {
      const key = toLower(e.key);
      if (this.keyMap[key] != undefined) {
        this._keys.add(key);
        e.preventDefault();
      }
    };
    const keyupHandle = (e: KeyboardEvent) => {
      this._keys.delete(e.key);
    };

    document.addEventListener("keydown", keydownHandle);
    document.addEventListener("keyup", keyupHandle);

    // 清理事件
    this.cleanEvent = () => {
      document.removeEventListener("keydown", keydownHandle);
      document.removeEventListener("keyup", keyupHandle);
    };
  }
}
