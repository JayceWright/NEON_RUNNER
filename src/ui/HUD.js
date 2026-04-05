/**
 * HUD — Updates score, speed, and high score DOM elements.
 */
export class HUD {
  constructor() {
    this.scoreEl = document.getElementById('current-score');
    this.highScoreEl = document.getElementById('high-score');
    this.speedEl = document.getElementById('speed-display');
  }

  /**
   * @param {number} score
   */
  updateScore(score) {
    if (this.scoreEl) this.scoreEl.innerText = score.toLocaleString();
  }

  /**
   * @param {number} speed — display speed in km/h
   */
  updateSpeed(speed) {
    if (this.speedEl) this.speedEl.innerText = speed.toString();
  }

  /**
   * @param {number} highScore
   */
  updateHighScore(highScore) {
    if (this.highScoreEl) this.highScoreEl.innerText = highScore.toLocaleString();
  }
}
