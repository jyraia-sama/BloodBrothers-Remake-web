import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { UNITS_DATABASE } from '../database.js';
import { SUMMON_POOL_DATABASE } from './SummonPoolData.js';
import { createUnitInstance } from '../levelSystem.js';

// Unités réservées aux combats (non invocables par le joueur)
const ENEMY_ONLY_KEYS = [
  'boss', 'squelette', 'demon_inf',
  // Ennemis de zone par palier
  'gobelin_maraudeur', 'loup_affame', 'rat_corrompu',
  'zombie_enrage', 'brigand_cagoule', 'araignee_geante',
  'golem_fissure', 'harpie_sanglante', 'ombre_rampante',
  'spectre_vengeur', 'troll_cavernes', 'cyclope_furieux',
  'demon_mineur', 'liche_novice', 'gargouille_jade',
  'chevalier_dechu', 'hydre_bicephale', 'vouivre_ecarlate',
  // Boss d'Acte
  'gardien_foret', 'seigneur_donjon'
];

// Pacte Doré (100 Or) : uniquement les raretés N / R / SR
const GOLD_RARITY_WEIGHTS = {
  N: 62,
  R: 30,
  SR: 8
};

// Pacte Supérieur (1 Éclat) : uniquement les raretés SR / SSR / UR
const SHARD_RARITY_WEIGHTS = {
  SR: 60,
  SSR: 33,
  UR: 7
};

const RARITY_COLORS = {
  N: '#cccccc',
  R: '#66ccff',
  SR: '#cc88ff',
  SSR: '#ffdd00',
  UR: '#ff66ff'
};

export class GachaScene extends Phaser.Scene {
  constructor() { super({ key: 'GachaScene' }); }

  create() {
    this.add.text(400, 45, "AUTEL D'INVOCATION", { fontSize: '26px', color: '#aa00aa', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.goldText = this.add.text(280, 78, `💰 ${PLAYER_DATA.gold}`, { fontSize: '16px', color: '#ffdd00' }).setOrigin(0.5);
    this.shardText = this.add.text(520, 78, `🌠 ${PLAYER_DATA.summonShards || 0}`, { fontSize: '16px', color: '#ff88ff' }).setOrigin(0.5);

    this.cardDisplay = this.add.rectangle(400, 260, 170, 220, 0x222233).setStrokeStyle(2, 0x555577);
    this.cardText = this.add.text(400, 240, 'Faites un pacte !', { fontSize: '16px', color: '#888888' }).setOrigin(0.5);
    this.rarityText = this.add.text(400, 280, '', { fontSize: '20px', fontStyle: 'bold' }).setOrigin(0.5);
    this.levelText = this.add.text(400, 310, '', { fontSize: '13px', color: '#00ffaa' }).setOrigin(0.5);

    // --- Pacte Doré ---
    const goldBtn = this.add.rectangle(230, 420, 260, 50, 0x8800aa).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff);
    this.add.text(230, 412, 'PACTE DORÉ (100 Or)', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(230, 430, 'N • R • SR', { fontSize: '10px', color: '#dddddd' }).setOrigin(0.5);
    goldBtn.on('pointerdown', () => this.drawSummon('gold'));

    // --- Pacte Supérieur ---
    const shardBtn = this.add.rectangle(570, 420, 260, 50, 0x662299).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xff88ff);
    this.add.text(570, 412, 'PACTE SUPÉRIEUR (1 🌠)', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(570, 430, 'SR • SSR • UR', { fontSize: '10px', color: '#ffccff' }).setOrigin(0.5);
    shardBtn.on('pointerdown', () => this.drawSummon('shard'));

    this.add.text(400, 460, "Les Éclats de Pacte Supérieur s'obtiennent en battant des BOSS.", {
      fontSize: '11px', color: '#8d94a3'
    }).setOrigin(0.5);

    this.logText = this.add.text(400, 500, '', { fontSize: '14px', color: '#ff4444' }).setOrigin(0.5);
  }

  /** Tire une clé d'unité en respectant les probabilités de rareté du pool fourni. */
  pickWeightedKey(weights) {
    const allowedRarities = Object.keys(weights);
    const pool = Object.keys(SUMMON_POOL_DATABASE).filter(k =>
      !ENEMY_ONLY_KEYS.includes(k) && allowedRarities.includes(SUMMON_POOL_DATABASE[k].rarity)
    );
    if (pool.length === 0) return null;

    const byRarity = {};
    pool.forEach(key => {
      const rarity = SUMMON_POOL_DATABASE[key].rarity;
      if (!byRarity[rarity]) byRarity[rarity] = [];
      byRarity[rarity].push(key);
    });

    const available = Object.keys(byRarity);
    const totalWeight = available.reduce((sum, r) => sum + (weights[r] || 0), 0);
    if (totalWeight <= 0) return Phaser.Utils.Array.GetRandom(pool);

    let roll = Math.random() * totalWeight;
    for (const rarity of available) {
      roll -= (weights[rarity] || 0);
      if (roll <= 0) {
        return Phaser.Utils.Array.GetRandom(byRarity[rarity]);
      }
    }

    return Phaser.Utils.Array.GetRandom(pool);
  }

  drawSummon(pactType) {
    const isShardPact = pactType === 'shard';

    if (isShardPact) {
      if ((PLAYER_DATA.summonShards || 0) < 1) {
        this.logText.setText("Pas assez d'Éclats de Pacte Supérieur !");
        return;
      }
    } else if (PLAYER_DATA.gold < 100) {
      this.logText.setText("Pas assez d'or !");
      return;
    }

    const weights = isShardPact ? SHARD_RARITY_WEIGHTS : GOLD_RARITY_WEIGHTS;
    const drawnKey = this.pickWeightedKey(weights);
    if (!drawnKey) {
      this.logText.setText('Aucune unité disponible à invoquer !');
      return;
    }

    if (isShardPact) {
      PLAYER_DATA.summonShards -= 1;
    } else {
      PLAYER_DATA.gold -= 100;
    }

    const unit = UNITS_DATABASE[drawnKey];

    const instance = createUnitInstance(drawnKey);
    PLAYER_DATA.inventory.push(instance);
    saveGameData();

    this.goldText.setText(`💰 ${PLAYER_DATA.gold}`);
    this.shardText.setText(`🌠 ${PLAYER_DATA.summonShards || 0}`);
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