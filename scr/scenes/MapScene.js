import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { CHAPTERS_DATABASE } from '../database.js';

export class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' });
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.currentChapter = CHAPTERS_DATABASE.find(c => c.id === PLAYER_DATA.currentChapter);
    const mapTiles = this.currentChapter.tiles;

    this.add.rectangle(400, 300, 800, 600, this.currentChapter.bgColor);
    this.add.text(400, 30, this.currentChapter.title.toUpperCase(), { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Chapitres', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('ChapterSelectScene'));

    const startX = 800 / (mapTiles.length + 1);
    const spacingX = (800 - startX * 2) / Math.max(1, mapTiles.length - 1);
    const startY = 300;

    const pathGraphics = this.add.graphics();
    pathGraphics.lineStyle(6, 0x555566, 1);
    pathGraphics.beginPath();
    pathGraphics.moveTo(startX, startY);
    pathGraphics.lineTo(startX + (mapTiles.length - 1) * spacingX, startY);
    pathGraphics.strokePath();

    mapTiles.forEach((tile, index) => {
      const x = startX + index * spacingX;
      this.add.circle(x, startY, 28, tile.color).setStrokeStyle(3, 0xffffff);
      this.add.text(x, startY + 40, tile.label, { fontSize: '12px', color: '#cccccc' }).setOrigin(0.5);
      tile.x = x;
      tile.y = startY;
    });

    const currentTile = mapTiles[PLAYER_DATA.currentTileIndex];
    this.playerGraphic = this.add.circle(currentTile.x, currentTile.y, 18, 0x00aaff).setStrokeStyle(3, 0xffffff);

    this.add.rectangle(400, 90, 760, 40, 0x222233).setStrokeStyle(1, 0x555577);
    this.uiText = this.add.text(30, 82, '', { fontSize: '16px', color: '#ffffff' });
    this.updateUI();

    this.logText = this.add.text(400, 480, 'Cliquez sur "Avancer" pour explorer.', { fontSize: '16px', color: '#ffcc00' }).setOrigin(0.5);

    const btnBg = this.add.rectangle(400, 540, 220, 45, 0x338833).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff);
    this.add.text(400, 540, 'AVANCER (-1 Stamina)', { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    btnBg.on('pointerdown', () => this.movePlayer());
  }

  updateUI() {
    const tilesCount = this.currentChapter.tiles.length;
    this.uiText.setText(`⚡ Stamina: ${PLAYER_DATA.stamina}/${PLAYER_DATA.maxStamina}   |   💰 Or: ${PLAYER_DATA.gold}   |   📍 Case: ${PLAYER_DATA.currentTileIndex + 1}/${tilesCount}`);
  }

  movePlayer() {
    const mapTiles = this.currentChapter.tiles;

    if (PLAYER_DATA.stamina <= 0) {
      this.logText.setText('Plus assez de Stamina ! Reviens plus tard.').setColor('#ff4444');
      return;
    }
    if (PLAYER_DATA.currentTileIndex >= mapTiles.length - 1) {
      this.logText.setText('Chapitre déjà terminé !').setColor('#00ff00');
      return;
    }

    PLAYER_DATA.stamina -= 1;
    PLAYER_DATA.currentTileIndex += 1;
    saveGameData();
    this.updateUI();

    const targetTile = mapTiles[PLAYER_DATA.currentTileIndex];

    this.tweens.add({
      targets: this.playerGraphic,
      x: targetTile.x,
      y: targetTile.y - 10,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        this.playerGraphic.setPosition(targetTile.x, targetTile.y);
        this.handleTileEvent(targetTile);
      }
    });
  }

  handleTileEvent(tile) {
    if (tile.type === 'gold') {
      const gainedGold = Math.floor(Math.random() * 50) + 30;
      PLAYER_DATA.gold += gainedGold;
      saveGameData();
      this.logText.setText(`Trésor trouvé ! +${gainedGold} Or.`).setColor('#ffdd00');
      this.updateUI();
    } else if (tile.type === 'heal') {
      PLAYER_DATA.stamina = Math.min(PLAYER_DATA.maxStamina, PLAYER_DATA.stamina + 3);
      saveGameData();
      this.logText.setText('Fontaine miraculeuse ! +3 Stamina.').setColor('#44ff44');
      this.updateUI();
    } else if (tile.type === 'battle' || tile.type === 'boss') {
      this.logText.setText('Combat enclenché !').setColor('#ff4444');
      this.time.delayedCall(800, () => {
        this.scene.start('BattleScene', { isBoss: tile.type === 'boss', chapter: this.currentChapter });
      });
    } else {
      this.logText.setText('Voie libre.').setColor('#ffffff');
    }
  }
}