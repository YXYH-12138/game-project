import { Assets, Container, Sprite, Texture, type Application } from "pixi.js";
import { Movement } from "./move";
import { AutoShootPlugin } from "./bullet";
import type { GameCore, IGamePlugin } from "../core/game";

export interface IPlayerOption {
  width?: number;
  height?: number;
  direction: Direction;
  textureLoad?: () => Promise<Texture>;
}

export const enum Direction {
  TOP = "TOP",
  BOTTOM = "BOTTOM",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

const DEFAULT_OPTION = {
  direction: Direction.TOP,
  width: 40,
  height: 40,
  textureLoad: () => Assets.load("https://pixijs.com/assets/bunny.png"),
};

export class Player extends Container {
  option: Required<IPlayerOption>;

  constructor(app: Application, option?: IPlayerOption) {
    super();
    this.option = Object.assign({}, DEFAULT_OPTION, option);
    app.stage.addChild(this);

    this.init();
  }

  setDirection(direction: Direction) {
    switch (direction) {
      case Direction.BOTTOM:
        this.rotation = Math.PI;
        break;
      case Direction.LEFT:
        this.rotation = -Math.PI / 2;
        break;
      case Direction.RIGHT:
        this.rotation = Math.PI / 2;
        break;
      default:
        this.rotation = 0;
        break;
    }
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  async init() {
    const { option } = this;
    const { width, height, textureLoad } = option;
    // Load the bunny texture
    const texture = await textureLoad();

    const bunny = new Sprite(texture);
    bunny.width = width;
    bunny.height = height;
    this.addChild(bunny);

    this.setDirection(option.direction);

    // Center the bunny sprites in local container coordinates
    this.pivot.x = this.width / 2;
    this.pivot.y = this.height / 2;
  }
}

export type PlayerContext = {
  player: Player;
};

function initPlayer(): IGamePlugin {
  const install = (game: GameCore<PlayerContext>) => {
    const { app } = game;
    const player = new Player(app);
    // const { container } = player;

    // Move the container to the center
    player.setPosition(app.screen.width / 2, app.screen.height / 2);

    game.use(new Movement({ player })).use(new AutoShootPlugin(player)).inject({ player });
  };

  return { install };
}

// 在玩家位置留下粒子轨迹
// const particleTrailPlugin: IGamePlugin = {
//   id: "particle-trail",
//   install(game: GameCore<PlayerContext>) {
//     const { player } = game.context;
//     game.addTicker(() => {
//       // 在玩家位置留下粒子轨迹
//       const particle = new Graphics().circle(0, 0, 2).fill({ color: 0x00ff00, alpha: 0.5 });

//       particle.position.set(player.container.x, player.container.y);
//       game.app.stage.addChild(particle);

//       // 1秒后消失
//       setTimeout(() => particle.destroy(), 500);
//     });
//   },
// };

export const playerPlugins = [initPlayer];
