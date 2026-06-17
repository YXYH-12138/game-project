// description: This example demonstrates how to use a Container to group and manipulate multiple sprites
// import { Bullet } from "./modules/bullet";
import "./theme/reset.css";
import { GameCore } from "./core/game";
import { scene } from "./modules/scene";

(async () => {
  const game = new GameCore();
  await game.init({ background: "#000000", width: 800, height: 600 });

  document.body.appendChild(game.app.canvas);

  game.use(scene).start();
})();
