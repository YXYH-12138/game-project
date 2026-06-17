import { Graphics, Sprite, Texture, Ticker } from "pixi.js";
import { Direction, type Player } from "./player";
import type { GameCore, IGamePlugin } from "../core/game";

interface Bullet {
  sprite: Sprite;
  vx: number;
  vy: number;
  speed: number;
  lifetime: number;
}

// export class BulletPlugin {
//   id = "bullet";

//   private _player!: Player;
//   private _bullets: Bullet[] = [];
//   private _bulletTexture!: Texture;
//   private _fireCooldown = 0.2;
//   private _lastFireTime = 0;
//   private _bulletSpeed = 500;
//   private _bulletLifetime = 2;
//   private _mousePos = { x: 0, y: 0 };
//   private _cleanEvents: (() => void) | null = null;

//   install(player: Player) {
//     this._player = player;
//     this.createBulletTexture();
//   }

//   start() {
//     this.initEvents();
//     this._player.addTicker(this.update);
//   }

//   stop() {
//     this._player.removeTicker(this.update);
//     this._bullets.forEach((b) => b.sprite.destroy());
//     this._bullets = [];
//   }

//   destroy() {
//     this._cleanEvents?.();
//     this._cleanEvents = null;
//     this.stop();
//   }

//   private createBulletTexture() {
//     const graphics = new Graphics();
//     graphics.circle(0, 0, 4);
//     graphics.fill({ color: 0xffff00 });
//     this._bulletTexture = this._player.app.renderer.generateTexture(graphics);
//   }

//   private initEvents() {
//     if (this._cleanEvents) return;

//     const pointerMove = (e: PointerEvent) => {
//       this._mousePos = this._player.app.stage.toLocal(this._player.app.renderer.events.pointer);
//     };

//     const keyDown = (e: KeyboardEvent) => {
//       if (e.code === "Space") {
//         this.fire();
//       }
//     };

//     document.addEventListener("pointermove", pointerMove);
//     document.addEventListener("keydown", keyDown);

//     this._cleanEvents = () => {
//       document.removeEventListener("pointermove", pointerMove);
//       document.removeEventListener("keydown", keyDown);
//     };
//   }

//   private fire() {
//     const now = performance.now() / 1000;
//     if (now - this._lastFireTime < this._fireCooldown) return;
//     this._lastFireTime = now;

//     const { x: startX, y: startY } = this._player.container;
//     const { x: targetX, y: targetY } = this._mousePos;

//     const dx = targetX - startX;
//     const dy = targetY - startY;
//     const len = Math.sqrt(dx * dx + dy * dy);

//     if (len === 0) return;

//     const dirX = dx / len;
//     const dirY = dy / len;

//     const bulletSprite = new Sprite(this._bulletTexture);
//     bulletSprite.anchor.set(0.5);
//     bulletSprite.position.set(startX, startY);
//     this._player.container.addChild(bulletSprite);

//     this._bullets.push({
//       sprite: bulletSprite,
//       vx: dirX,
//       vy: dirY,
//       speed: this._bulletSpeed,
//       lifetime: this._bulletLifetime,
//     });
//   }

//   private update = (ticker: Ticker) => {
//     const dt = ticker.deltaTime;

//     for (let i = this._bullets.length - 1; i >= 0; i--) {
//       const bullet = this._bullets[i];

//       bullet.sprite.x += bullet.vx * bullet.speed * dt;
//       bullet.sprite.y += bullet.vy * bullet.speed * dt;
//       bullet.lifetime -= dt;

//       if (bullet.lifetime <= 0 || this.isOutOfScreen(bullet.sprite)) {
//         bullet.sprite.destroy();
//         this._bullets.splice(i, 1);
//       }
//     }
//   };

//   private isOutOfScreen(sprite: Sprite): boolean {
//     const margin = 50;
//     const { width, height } = this._player.app.screen;
//     return (
//       sprite.x < -margin ||
//       sprite.x > width + margin ||
//       sprite.y < -margin ||
//       sprite.y > height + margin
//     );
//   }
// }

interface BulletOption {
  bulletSpeed?: number;
  fireInterval?: number;
}

export class AutoShootPlugin implements IGamePlugin {
  private _game: GameCore;
  private _player!: Player;

  private _bullets: Bullet[] = [];
  private _bulletTexture!: Texture;

  /** 发射定时器 */
  private _timer = 0;
  /** 发射间隔，单位ms */
  private _fireInterval: number;
  /** 子弹速度 */
  private _bulletSpeed: number;
  /** 子弹生命周期，单位ms */
  private _bulletLifetime = 10 * 1000;
  /** 射击方向 */
  private _shootDirection = { x: 0, y: -1 };

  constructor(player: Player, { bulletSpeed, fireInterval }: BulletOption = {}) {
    this._player = player;
    this._bulletSpeed = bulletSpeed ?? 6;
    this._fireInterval = fireInterval ?? 50;
  }

  install(game: GameCore) {
    this._game = game;
    this.initDirection(this._player);
  }

  start() {
    this.createBulletTexture();
    this._game.addTicker(this.update);
  }

  stop() {
    this._game.removeTicker(this.update);
    // this.clearBullets();
  }

  destroy() {
    this.stop();
  }

  setDirection(x: number, y: number) {
    const len = Math.sqrt(x * x + y * y);
    if (len > 0) {
      this._shootDirection.x = x / len;
      this._shootDirection.y = y / len;
    }
  }

  clearBullets() {
    this._bullets.forEach((b) => b.sprite.destroy());
    this._bullets = [];
  }

  private initDirection(player: Player) {
    switch (player.option.direction) {
      case Direction.TOP:
        this.setDirection(0, -1);
        break;
      case Direction.BOTTOM:
        this.setDirection(0, 1);
        break;
      case Direction.LEFT:
        this.setDirection(-1, 0);
        break;
      case Direction.RIGHT:
        this.setDirection(1, 0);
        break;
    }
  }

  private createBulletTexture() {
    const graphics = new Graphics();
    graphics.circle(0, 0, 4);
    // 红色子弹
    graphics.fill({ color: 0xff4444 });
    this._bulletTexture = this._game.app.renderer.generateTexture(graphics);
  }

  private fire() {
    const { x, y } = this._player;
    const { x: dirX, y: dirY } = this._shootDirection;

    const bulletSprite = new Sprite(this._bulletTexture);
    // 子弹锚点设置为中心
    bulletSprite.anchor.set(0.5);
    bulletSprite.position.set(x, y);

    this._game.app.stage.addChild(bulletSprite);

    // 添加子弹到数组
    this._bullets.push({
      sprite: bulletSprite,
      vx: dirX,
      vy: dirY,
      speed: this._bulletSpeed,
      lifetime: this._bulletLifetime,
    });
  }

  private update = (ticker: Ticker) => {
    const dt = ticker.deltaTime;

    // 定时发射
    this._timer += dt;
    while (this._timer >= this._fireInterval) {
      this._timer -= this._fireInterval;
      this.fire();
    }

    // 移动子弹
    for (let i = this._bullets.length - 1; i >= 0; i--) {
      const bullet = this._bullets[i];
      bullet.sprite.x += bullet.vx * bullet.speed * dt;
      bullet.sprite.y += bullet.vy * bullet.speed * dt;
      bullet.lifetime -= dt;

      if (bullet.lifetime <= 0 || this.isOutOfScreen(bullet.sprite)) {
        bullet.sprite.destroy();
        this._bullets.splice(i, 1);
      }
    }
  };

  private isOutOfScreen(sprite: Sprite): boolean {
    const margin = 50;
    const { width, height } = this._game.app.screen;
    return (
      sprite.x < -margin ||
      sprite.x > width + margin ||
      sprite.y < -margin ||
      sprite.y > height + margin
    );
  }
}
