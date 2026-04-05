/**
 * SandboxMode — Labs/testing mode with God Mode always on,
 * animation controls, and physics tweaking.
 * TODO: Expand with UI controls panel in future.
 */
import { ClassicMode } from './ClassicMode.js';

export class SandboxMode extends ClassicMode {
  constructor(deps) {
    super(deps);
    this.name = 'Sandbox';
  }

  /** @override — God mode is always on in sandbox. */
  start() {
    super.start();
    this.player.godMode = true;
    this.player.model.setGodModeVisual(true);
    console.log('[SandboxMode] Started with God Mode ON');
  }

  /** @override — No death in sandbox. */
  onDeath() {
    // In sandbox, death is ignored.
    console.log('[SandboxMode] Death ignored (God Mode)');
  }
}
