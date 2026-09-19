import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { ACTS_DATABASE } from '../database.js';
import { makeScrollable } from '../scrollHelper.js';

const ACT_LIST_VIEWPORT = { x: 400, y: 335, width: 620, height: 480 };
const ACT_ROW_HEIGHT = 140;

export class ChapterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChapterSelectScene' });
  }

  create(data) {
    this.actListScroll = null;
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
    if (this.actListScroll) {
      this.actListScroll.destroy();
      this.actListScroll = null;
    }
    this.children.removeAll();
  }

  // ---------- Écran 1 : liste des Actes (un par Set d'Écho) ----------
  drawActList() {
    this.clearScene();

    this.add.text(400, 35, 'AVENTURE', { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(400, 60, 'Chaque Acte est lié à un Set d\'Écho Sanguin', { fontSize: '11px', color: '#8d94a3' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff).setDepth(50);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5).setDepth(51);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    const container = this.add.container(0, 0);
    const viewportTop = ACT_LIST_VIEWPORT.y - ACT_LIST_VIEWPORT.height / 2;

    ACTS_DATABASE.forEach((act, index) => {
      const y = viewportTop + 65 + index * ACT_ROW_HEIGHT;
      const firstChapterId = act.chapters[0].id;
      const isUnlocked = firstChapterId <= PLAYER_DATA.unlockedChapter;
      const clearedCount = act.chapters.filter(c => c.id < PLAYER_DATA.unlockedChapter).length;

      const cardBg = this.add.rectangle(400, y, 600, 120, isUnlocked ? act.bgColor : 0x222222)
        .setStrokeStyle(2, isUnlocked ? 0xffffff : 0x555555)
        .setInteractive({ useHandCursor: isUnlocked });

      const titleText = this.add.text(120, y - 38, act.title, { fontSize: '17px', color: isUnlocked ? '#ffffff' : '#888888', fontStyle: 'bold' });
      const progressStr = isUnlocked
        ? `${act.chapters.length} chapitres  •  Progression : ${clearedCount}/${act.chapters.length}`
        : '🔒 Acte Verrouillé';
      const progressText = this.add.text(120, y - 12, progressStr, { fontSize: '12px', color: isUnlocked ? '#ffdd00' : '#666666' });

      const setStr = isUnlocked
        ? `✨ Set d'Écho : ${act.setName} — ${act.setDescription}`
        : '';
      const setText = this.add.text(120, y + 14, setStr, {
        fontSize: '11px', color: '#88ddff', wordWrap: { width: 560 }
      });

      container.add([cardBg, titleText, progressText, setText]);

      if (isUnlocked) {
        cardBg.on('pointerdown', () => this.drawChapterList(act));
        cardBg.on('pointerover', () => cardBg.setAlpha(0.8));
        cardBg.on('pointerout', () => cardBg.setAlpha(1.0));
      }
    });

    const contentHeight = ACTS_DATABASE.length * ACT_ROW_HEIGHT + 20;
    this.actListScroll = makeScrollable(this, container, ACT_LIST_VIEWPORT, contentHeight);
  }

  // ---------- Écran 2 : chapitres de l'acte sélectionné ----------
  drawChapterList(act) {
    this.clearScene();

    this.add.text(400, 32, act.title.toUpperCase(), { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(400, 54, `Set : ${act.setName} — ${act.setDescription}`, {
      fontSize: '11px', color: '#88ddff', align: 'center', wordWrap: { width: 640 }
    }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff).setDepth(50);
    this.add.text(70, 30, '‹ Actes', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5).setDepth(51);
    backBtn.on('pointerdown', () => this.drawActList());

    const cols = 2;
    const cardW = 340, cardH = 100;
    const startX = 400 - (cardW + 20) / 2;
    const startY = 130;

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

      this.add.text(x - cardW / 2 + 15, y - 32, `Chapitre ${chapter.chapterNum}`, { fontSize: '16px', color: isUnlocked ? '#ffffff' : '#888888', fontStyle: 'bold' });
      const infoStr = isUnlocked
        ? `${chapter.tiles.length} cases${hasBranch ? ' • Embranchement' : ''}  |  ${chapter.rewardGold} Or`
        : '🔒 Verrouillé';
      this.add.text(x - cardW / 2 + 15, y - 10, infoStr, { fontSize: '12px', color: isUnlocked ? '#ffdd00' : '#666666' });

      if (isUnlocked) {
        this.add.text(x - cardW / 2 + 15, y + 14, `✨ ${chapter.dropText}`, {
          fontSize: '11px', color: '#88ddff', wordWrap: { width: cardW - 30 }
        });
      }

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