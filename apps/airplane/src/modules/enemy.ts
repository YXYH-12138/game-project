import type { GameCore, IGamePlugin } from "../core/game";
import { AutoShootPlugin } from "./bullet";
import { type PlayerContext, Player, Direction } from "./player";

export const enemy: IGamePlugin = {
  id: "enemy",
  install(game: GameCore<PlayerContext>) {
    const { app } = game;
    const enemy = new Player(app, { direction: Direction.BOTTOM });

    game.use(new AutoShootPlugin(enemy, { fireInterval: 100 }));

    enemy.setPosition(500, 80);
  },
};
