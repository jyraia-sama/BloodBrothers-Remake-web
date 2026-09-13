import { HeroSelectScene } from './scenes/HeroSelectScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { ChapterSelectScene } from './scenes/ChapterSelectScene.js';
import { MapScene } from './scenes/MapScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { DeckScene } from './scenes/DeckScene.js';
import { GachaScene } from './scenes/GachaScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#111116',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MenuScene, HeroSelectScene, ChapterSelectScene, DeckScene, GachaScene, MapScene, BattleScene]
};

new Phaser.Game(config);