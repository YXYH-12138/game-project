// description: This example demonstrates how to use a Container to group and manipulate multiple sprites
import { Application } from "pixi.js";
// import { Bullet } from "./modules/bullet";
import { Player } from "./modules/player";
import { MovementPlugin } from "./modules/move";
import { AutoShootPlugin } from "./modules/bullet";
import "./theme/reset.css";

(async () => {
  // Create a new application
  const app = new Application();

  const gameEl = document.createElement("div");
  gameEl.style.width = "800px";
  gameEl.style.height = "600px";

  document.body.appendChild(gameEl);

  // Initialize the application
  await app.init({ background: "#000000", width: 800, height: 600 });
  gameEl.appendChild(app.canvas);

  const player = new Player(app).use(new MovementPlugin()).use(new AutoShootPlugin());

  player.start();
})();
