/**
 * NEON_RUNNER — Main Entry Point
 * Wires together all modules, loads assets, and bootstraps the game.
 */
import { Engine } from './core/Engine.js';
import { GameLoop } from './core/GameLoop.js';
import { InputManager } from './core/InputManager.js';
import { EventBus } from './utils/EventBus.js';
import { Player } from './entities/Player.js';
import { SharedResources } from './world/SharedResources.js';
import { PlatformManager } from './world/PlatformManager.js';
import { Environment } from './world/Environment.js';
import { UIManager } from './ui/UIManager.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { ScoreSystem } from './systems/ScoreSystem.js';
import { ClassicMode } from './modes/ClassicMode.js';

// ─── Bootstrap ───────────────────────────────────────────────────────────────

const bus = new EventBus();
const engine = new Engine(document.getElementById('game-container'));
const loop = new GameLoop();
const input = new InputManager(bus);
const resources = new SharedResources();
const player = new Player(engine.scene, bus);
const platforms = new PlatformManager(engine.scene, resources);
const env = new Environment(engine.scene);
const ui = new UIManager(bus);
const collision = new CollisionSystem(player, platforms, bus);
const score = new ScoreSystem(bus);

// Create game mode
const classicMode = new ClassicMode({
  engine, loop, player, platforms, env, collision, score, ui, bus,
});

// ─── Load Model & Start ──────────────────────────────────────────────────────

// Initial render (shows the scene before model loads)
engine.render();

// Load model, then show START button
player.loadModel((text) => ui.showLoading(text))
  .then(() => {
    ui.showStartButton();
  })
  .catch((err) => {
    console.error('Failed to load model:', err);
    ui.showLoading('MODEL ERROR: ' + err.message);
  });

// Expose startGame globally for the HTML onclick
window.startGame = () => classicMode.start();
