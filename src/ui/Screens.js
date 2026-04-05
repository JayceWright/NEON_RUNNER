/**
 * Screens — Start, Game Over, Pause screen management.
 */
export class Screens {
  constructor() {
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.loadingText = document.getElementById('loading-text');
    this.startBtn = document.getElementById('start-btn');
    this.finalScoreEl = document.getElementById('final-score');
  }

  /** Show loading text. */
  showLoading(text = 'LOADING MODEL...') {
    if (this.loadingText) {
      this.loadingText.style.display = 'block';
      this.loadingText.innerText = text;
    }
  }

  /** Hide loading, show start button. */
  showStartButton() {
    if (this.loadingText) this.loadingText.style.display = 'none';
    if (this.startBtn) this.startBtn.style.display = 'block';
  }

  /** Hide start screen. */
  hideStart() {
    if (this.startScreen) this.startScreen.style.display = 'none';
  }

  /** Show game over with final score. */
  showGameOver(score) {
    if (this.finalScoreEl) this.finalScoreEl.innerText = score.toLocaleString();
    if (this.gameOverScreen) this.gameOverScreen.style.display = 'flex';
  }

  /** Hide game over. */
  hideGameOver() {
    if (this.gameOverScreen) this.gameOverScreen.style.display = 'none';
  }

  /** Show pause overlay. */
  showPause() {
    if (this.pauseScreen) this.pauseScreen.style.display = 'flex';
  }

  /** Hide pause overlay. */
  hidePause() {
    if (this.pauseScreen) this.pauseScreen.style.display = 'none';
  }

  /** Check if start screen is visible. */
  get isStartVisible() {
    return this.startScreen && this.startScreen.style.display !== 'none';
  }

  /** Check if game over screen is visible. */
  get isGameOverVisible() {
    return this.gameOverScreen && this.gameOverScreen.style.display !== 'none';
  }
}
