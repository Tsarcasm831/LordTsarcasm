import { loadAssets } from './assets.js';
import { initGame } from './gameLogic.js';
import { setupEventListeners } from './events.js';
import { initUI } from './ui.js';

async function init() {
  await loadAssets();
  initUI();
  setupEventListeners();
  initGame();
}

init();
