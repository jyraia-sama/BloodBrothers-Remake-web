import { HeroSelectScene } from './scenes/HeroSelectScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { ChapterSelectScene } from './scenes/ChapterSelectScene.js';
import { MapScene } from './scenes/MapScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { DeckScene } from './scenes/DeckScene.js';
import { GachaScene } from './scenes/GachaScene.js';
import { FusionScene } from './scenes/FusionScene.js'; // <-- Ajout de l'import

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
  scene: [MenuScene, HeroSelectScene, ChapterSelectScene, DeckScene, GachaScene, FusionScene, MapScene, BattleScene] // <-- Ajout dans le tableau
};

new Phaser.Game(config);