

import { Game } from './game.js';

let game;

function init() {
  const canvas = document.getElementById('game-canvas');
  game = new Game(canvas);
  game.init();
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  game.update();
}

init();

