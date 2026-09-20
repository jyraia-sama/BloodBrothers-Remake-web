import { HeroSelectScene } from './scenes/HeroSelectScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { ChapterSelectScene } from './scenes/ChapterSelectScene.js';
import { MapScene } from './scenes/MapScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { DeckScene } from './scenes/DeckScene.js';
import { GachaScene } from './scenes/GachaScene.js';
import { FusionScene } from './scenes/FusionScene.js'; // <-- Ajout de l'import
import { EchoScene } from './scenes/EchoScene.js';
import { DailyDungeonScene } from './scenes/DailyDungeonScene.js';
import { TowerScene } from './scenes/TowerScene.js';
import { ReliquaryScene } from './scenes/ReliquaryScene.js';

// Résolution interne du canvas : au minimum x2, davantage sur les écrans
// haute densité (Retina, 4K...) pour éviter le flou dû à l'agrandissement CSS.
const RENDER_ZOOM = Math.max(2, Math.round(window.devicePixelRatio || 1));

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#111116',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: RENDER_ZOOM
  },
  render: {
    antialias: true,
    roundPixels: false
  },
  scene: [MenuScene, HeroSelectScene, ChapterSelectScene, DeckScene, GachaScene, FusionScene, EchoScene, DailyDungeonScene, TowerScene, ReliquaryScene, MapScene, BattleScene] // <-- Ajout dans le tableau
};

const game = new Phaser.Game(config);

// --- Correctif mobile : sur certains navigateurs (Chrome Android notamment),
// Phaser calcule sa mise à l'échelle/son centrage AVANT que la barre d'adresse
// et les barres système aient fini de se stabiliser, ce qui laisse le jeu
// décentré et/ou trop petit. On force un recalcul une fois que tout est stable,
// et à chaque rotation ou redimensionnement de la fenêtre.
function refreshGameScale() {
  game.scale.refresh();
}

window.addEventListener('resize', refreshGameScale);
window.addEventListener('orientationchange', () => setTimeout(refreshGameScale, 250));
setTimeout(refreshGameScale, 350);