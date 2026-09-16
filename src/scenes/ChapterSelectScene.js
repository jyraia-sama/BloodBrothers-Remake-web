import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { ACTS_DATABASE } from '../database.js';

export class ChapterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChapterSelectScene' });
  }

  create(data) {
    if (data && data.actId) {
      const act = ACTS_DATABASE.find(a => a.id === data.actId);
      if (act) {
        this.drawChapterList(act);
        return;
      }
    }
    this.drawActList();
  }

  clearScene() {
    this.children.removeAll();
  }

  // ---------- Écran 1 : liste des Actes ----------
  drawActList() {
    this.clearScene();

    this.add.text(400, 40, 'AVENTURE', { fontSize: '26px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    ACTS_DATABASE.forEach((act, index) => {
      const y = 140 + index * 140;
      const firstChapterId = act.chapters[0].id;
      const isUnlocked = firstChapterId <= PLAYER_DATA.unlockedChapter;
      const clearedCount = act.chapters.filter(c => c.id < PLAYER_DATA.unlockedChapter).length;

      const cardBg = this.add.rectangle(400, y, 560, 110, isUnlocked ? act.bgColor : 0x222222)
        .setStrokeStyle(2, isUnlocked ? 0xffffff : 0x555555)
        .setInteractive({ useHandCursor: isUnlocked });

      this.add.text(160, y - 25, act.title, { fontSize: '19px', color: isUnlocked ? '#ffffff' : '#888888', fontStyle: 'bold' });
      const infoStr = isUnlocked
        ? `${act.chapters.length} chapitres  |  Progression : ${clearedCount}/${act.chapters.length}`
        : '🔒 Acte Verrouillé';
      this.add.text(160, y + 10, infoStr, { fontSize: '13px', color: isUnlocked ? '#ffdd00' : '#666666' });

      if (isUnlocked) {
        cardBg.on('pointerdown', () => this.drawChapterList(act));
        cardBg.on('pointerover', () => cardBg.setAlpha(0.8));
        cardBg.on('pointerout', () => cardBg.setAlpha(1.0));
      }
    });
  }

  // ---------- Écran 2 : chapitres de l'acte sélectionné ----------
  drawChapterList(act) {
    this.clearScene();

    this.add.text(400, 40, act.title.toUpperCase(), { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Actes', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.drawActList());

    const cols = 2;
    const cardW = 340, cardH = 90;
    const startX = 400 - (cardW + 20) / 2;
    const startY = 110;

    act.chapters.forEach((chapter, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardW + 20);
      const y = startY + row * (cardH + 15);

      const isUnlocked = chapter.id <= PLAYER_DATA.unlockedChapter;
      const hasBranch = chapter.tiles.some(t => t.next.length > 1);

      const cardBg = this.add.rectangle(x, y, cardW, cardH, isUnlocked ? act.bgColor : 0x222222)
        .setStrokeStyle(2, isUnlocked ? 0xffffff : 0x555555)
        .setInteractive({ useHandCursor: isUnlocked });

      this.add.text(x - cardW / 2 + 15, y - 25, `Chapitre ${chapter.chapterNum}`, { fontSize: '16px', color: isUnlocked ? '#ffffff' : '#888888', fontStyle: 'bold' });
      const infoStr = isUnlocked
        ? `${chapter.tiles.length} cases${hasBranch ? ' • Embranchement' : ''}  |  ${chapter.rewardGold} Or`
        : '🔒 Verrouillé';
      this.add.text(x - cardW / 2 + 15, y + 5, infoStr, { fontSize: '12px', color: isUnlocked ? '#ffdd00' : '#666666' });

      if (isUnlocked) {
        cardBg.on('pointerdown', () => {
          PLAYER_DATA.currentChapter = chapter.id;
          PLAYER_DATA.currentTileId = 0;
          saveGameData();
          this.scene.start('MapScene');
        });
        cardBg.on('pointerover', () => cardBg.setAlpha(0.8));
        cardBg.on('pointerout', () => cardBg.setAlpha(1.0));
      }
    });
  }
}