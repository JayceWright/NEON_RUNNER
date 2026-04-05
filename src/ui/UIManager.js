/**
 * UIManager — Coordinates HUD + Screens via EventBus.
 */
import { HUD } from './HUD.js';
import { Screens } from './Screens.js';

export class UIManager {
  /**
   * @param {import('../utils/EventBus.js').EventBus} bus
   */
  constructor(bus) {
    this.bus = bus;
    this.hud = new HUD();
    this.screens = new Screens();

    // Listen to game events
    this.bus.on('score:update', ({ score, speed }) => {
      this.hud.updateScore(score);
      this.hud.updateSpeed(speed);
    });

    this.bus.on('highscore:update', (highScore) => {
      this.hud.updateHighScore(highScore);
    });

    this.bus.on('game:over', ({ score }) => {
      this.screens.showGameOver(score);
    });

    this.bus.on('game:paused', () => {
      this.screens.showPause();
    });

    this.bus.on('game:resumed', () => {
      this.screens.hidePause();
    });
  }

  /** Show loading progress text. */
  showLoading(text) {
    this.screens.showLoading(text);
  }

  /** Show the start button (model loaded). */
  showStartButton() {
    this.screens.showStartButton();
  }

  /** Prepare UI for gameplay. */
  startGame() {
    this.hud.updateScore(0);
    this.hud.updateSpeed(140);
    this.screens.hideStart();
    this.screens.hideGameOver();
  }
}
