import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { CHAPTERS_DATABASE } from '../database.js';

export class ChapterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChapterSelectScene' });
  }

  create() {
    this.add.text(400, 40, 'SÉLECTION DU CHAPITRE', { fontSize: '26px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    CHAPTERS_DATABASE.forEach((chapter, index) => {
      const y = 130 + index * 120;
      const isUnlocked = chapter.id <= PLAYER_DATA.unlockedChapter;

      const cardBg = this.add.rectangle(400, y, 500, 95, isUnlocked ? chapter.bgColor : 0x222222)
        .setStrokeStyle(2, isUnlocked ? 0xffffff : 0x555555)
        .setInteractive({ useHandCursor: isUnlocked });

      this.add.text(180, y - 20, chapter.title, { fontSize: '18px', color: isUnlocked ? '#ffffff' : '#888888', fontStyle: 'bold' });
      const infoStr = isUnlocked ? `Nombre de cases : ${chapter.tiles.length}  |  Récompense Boss : ${chapter.rewardGold} Or` : '🔒 Chapitre Verrouillé';
      this.add.text(180, y + 10, infoStr, { fontSize: '13px', color: isUnlocked ? '#ffdd00' : '#666666' });

      if (isUnlocked) {
        cardBg.on('pointerdown', () => {
          PLAYER_DATA.currentChapter = chapter.id;
          PLAYER_DATA.currentTileIndex = 0;
          saveGameData();
          this.scene.start('MapScene');
        });
        cardBg.on('pointerover', () => cardBg.setAlpha(0.8));
        cardBg.on('pointerout', () => cardBg.setAlpha(1.0));
      }
    });
  }
}