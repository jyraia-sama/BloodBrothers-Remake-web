import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { UNITS_DATABASE } from '../database.js';
import { SUMMON_POOL_DATABASE } from './SummonPoolData.js';

export class GachaScene extends Phaser.Scene {
  constructor() { super({ key: 'GachaScene' }); }

  create() {
    this.add.text(400, 50, "AUTEL D'INVOCATION", { fontSize: '28px', color: '#aa00aa', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.goldText = this.add.text(400, 100, `💰 Or disponible : ${PLAYER_DATA.gold}`, { fontSize: '18px', color: '#ffdd00' }).setOrigin(0.5);

    this.cardDisplay = this.add.rectangle(400, 270, 160, 220, 0x222233).setStrokeStyle(2, 0x555577);
    this.cardText = this.add.text(400, 250, 'Faites un pacte !', { fontSize: '16px', color: '#888888' }).setOrigin(0.5);
    this.rarityText = this.add.text(400, 290, '', { fontSize: '20px', fontStyle: 'bold' }).setOrigin(0.5);

    const summonBtn = this.add.rectangle(400, 440, 220, 50, 0x8800aa).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff);
    this.add.text(400, 440, 'Pacte x1 (100 Or)', { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.logText = this.add.text(400, 510, '', { fontSize: '14px', color: '#ff4444' }).setOrigin(0.5);
    summonBtn.on('pointerdown', () => this.drawSummon());
  }

  drawSummon() {
    if (PLAYER_DATA.gold < 100) {
      this.logText.setText("Pas assez d'or !");
      return;
    }

    const availableKeys = Object.keys(SUMMON_POOL_DATABASE);

    if (availableKeys.length === 0) {
      this.logText.setText('Aucune unité disponible à invoquer !');
      return;
    }

    PLAYER_DATA.gold -= 100;

    const drawnKey = Phaser.Utils.Array.GetRandom(availableKeys);
    const unit = UNITS_DATABASE[drawnKey];

    PLAYER_DATA.inventory.push(drawnKey);
    saveGameData();

    this.goldText.setText(`💰 Or disponible : ${PLAYER_DATA.gold}`);
    this.logText.setText('');

    this.tweens.add({
      targets: this.cardDisplay,
      scaleX: 0,
      duration: 150,
      yoyo: true,
      onYoyo: () => {
        this.cardDisplay.setFillStyle(unit.color);
        this.cardText.setText(unit.name).setColor('#ffffff');
        this.rarityText.setText(`[${unit.rarity}]`).setColor(unit.rarity === 'SSR' ? '#ffdd00' : '#ffffff');
      }
    });
  }
}