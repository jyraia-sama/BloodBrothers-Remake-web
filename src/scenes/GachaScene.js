import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { UNITS_DATABASE } from '../database.js';
import { SUMMON_POOL_DATABASE } from './SummonPoolData.js';
import { createUnitInstance } from '../levelSystem.js';

// Unités réservées aux combats (non invocables par le joueur)
const ENEMY_ONLY_KEYS = ['boss', 'squelette', 'demon_inf'];

// Probabilités de tirage par rareté
const RARITY_WEIGHTS = {
  N: 55,
  R: 30,
  SR: 12,
  SSR: 3
};

const RARITY_COLORS = {
  N: '#cccccc',
  R: '#66ccff',
  SR: '#cc88ff',
  SSR: '#ffdd00'
};

export class GachaScene extends Phaser.Scene {
  constructor() { super({ key: 'GachaScene' }); }

  create() {
    this.add.text(400, 50, "AUTEL D'INVOCATION", { fontSize: '28px', color: '#aa00aa', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.goldText = this.add.text(400, 100, `💰 Or disponible : ${PLAYER_DATA.gold}`, { fontSize: '18px', color: '#ffdd00' }).setOrigin(0.5);

    this.add.text(400, 128, 'Taux : N 55%  |  R 30%  |  SR 12%  |  SSR 3%', { fontSize: '12px', color: '#8d94a3' }).setOrigin(0.5);

    this.cardDisplay = this.add.rectangle(400, 280, 160, 220, 0x222233).setStrokeStyle(2, 0x555577);
    this.cardText = this.add.text(400, 260, 'Faites un pacte !', { fontSize: '16px', color: '#888888' }).setOrigin(0.5);
    this.rarityText = this.add.text(400, 300, '', { fontSize: '20px', fontStyle: 'bold' }).setOrigin(0.5);
    this.levelText = this.add.text(400, 330, '', { fontSize: '13px', color: '#00ffaa' }).setOrigin(0.5);

    const summonBtn = this.add.rectangle(400, 440, 220, 50, 0x8800aa).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff);
    this.add.text(400, 440, 'Pacte x1 (100 Or)', { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.logText = this.add.text(400, 510, '', { fontSize: '14px', color: '#ff4444' }).setOrigin(0.5);
    summonBtn.on('pointerdown', () => this.drawSummon());
  }

  /** Tire une clé d'unité en respectant les probabilités de rareté. */
  pickWeightedKey() {
    const pool = Object.keys(SUMMON_POOL_DATABASE).filter(k => !ENEMY_ONLY_KEYS.includes(k));
    if (pool.length === 0) return null;

    // Regroupe les clés disponibles par rareté
    const byRarity = {};
    pool.forEach(key => {
      const rarity = SUMMON_POOL_DATABASE[key].rarity;
      if (!byRarity[rarity]) byRarity[rarity] = [];
      byRarity[rarity].push(key);
    });

    // Ne garde que les raretés réellement présentes dans le pool
    const available = Object.keys(byRarity);
    const totalWeight = available.reduce((sum, r) => sum + (RARITY_WEIGHTS[r] || 0), 0);
    if (totalWeight <= 0) return Phaser.Utils.Array.GetRandom(pool);

    let roll = Math.random() * totalWeight;
    for (const rarity of available) {
      roll -= (RARITY_WEIGHTS[rarity] || 0);
      if (roll <= 0) {
        return Phaser.Utils.Array.GetRandom(byRarity[rarity]);
      }
    }

    return Phaser.Utils.Array.GetRandom(pool);
  }

  drawSummon() {
    if (PLAYER_DATA.gold < 100) {
      this.logText.setText("Pas assez d'or !");
      return;
    }

    const drawnKey = this.pickWeightedKey();
    if (!drawnKey) {
      this.logText.setText('Aucune unité disponible à invoquer !');
      return;
    }

    PLAYER_DATA.gold -= 100;

    const unit = UNITS_DATABASE[drawnKey];

    // Création d'une instance propre au joueur (niveau 1, 0 XP)
    const instance = createUnitInstance(drawnKey);
    PLAYER_DATA.inventory.push(instance);
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
        this.rarityText.setText(`[${unit.rarity}]`).setColor(RARITY_COLORS[unit.rarity] || '#ffffff');
        this.levelText.setText('Niveau 1  •  0 XP');
      }
    });
  }
}