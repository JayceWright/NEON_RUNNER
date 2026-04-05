/**
 * ScoreSystem — Manages score, high score, and localStorage persistence.
 */
export class ScoreSystem {
  /**
   * @param {import('../utils/EventBus.js').EventBus} bus
   */
  constructor(bus) {
    this.bus = bus;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('neon_runner_high')) || 0;

    // Notify UI of initial high score
    this.bus.emit('highscore:update', this.highScore);
  }

  /**
   * Update score based on player distance.
   * @param {number} score — current score from player
   * @param {number} displaySpeed — speed for display
   */
  update(score, displaySpeed) {
    this.score = score;
    this.bus.emit('score:update', { score, speed: displaySpeed });
  }

  /** Finalize score on game over, save high score. */
  finalize() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('neon_runner_high', this.highScore);
      this.bus.emit('highscore:update', this.highScore);
    }
  }

  /** Reset score for new game. */
  reset() {
    this.score = 0;
  }
}
