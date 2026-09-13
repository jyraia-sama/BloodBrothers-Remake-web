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
    mode: Phaser.Scale.FIT,            // Adapte la taille du jeu à l'écran
    autoCenter: Phaser.Scale.CENTER_BOTH // Centre le jeu verticalement et horizontalement
  },
  scene: [MenuScene, ChapterSelectScene, DeckScene, GachaScene, MapScene, BattleScene]
};

new Phaser.Game(config);