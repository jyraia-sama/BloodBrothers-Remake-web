import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { UNITS_DATABASE, ENEMY_ONLY_KEYS } from '../database.js';
import { SUMMON_POOL_DATABASE } from './SummonPoolData.js';
import { createUnitInstance } from '../levelSystem.js';
import { ELEMENT_LABELS } from '../elements.js';
import { getItemCount, spendItem } from '../saveSystem.js';

// Pacte Doré (100 Or / pièce) : uniquement les raretés N / R / SR
const GOLD_RARITY_WEIGHTS = { N: 62, R: 30, SR: 8 };
const GOLD_COST_EACH = 100;

// Pacte Supérieur (1 Éclat / pièce) : uniquement les raretés SR / SSR / UR
const SHARD_RARITY_WEIGHTS = { SR: 60, SSR: 33, UR: 7 };
const SHARD_COST_EACH = 1;

const RARITY_COLORS = {
  N: '#cccccc',
  R: '#66ccff',
  SR: '#cc88ff',
  SSR: '#ffdd00',
  UR: '#ff66ff'
};

/** Formate une table de poids en texte de pourcentages, ex. "N 62% • R 30% • SR 8%". */
function formatRates(weights) {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  return Object.entries(weights)
    .map(([rarity, weight]) => `${rarity} ${Math.round((weight / total) * 100)}%`)
    .join('  •  ');
}

export class GachaScene extends Phaser.Scene {
  constructor() { super({ key: 'GachaScene' }); }

  create() {
    this.add.text(400, 40, "AUTEL D'INVOCATION", { fontSize: '24px', color: '#aa00aa', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff).setDepth(50);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5).setDepth(51);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.goldText = this.add.text(280, 70, `💰 ${PLAYER_DATA.gold}`, { fontSize: '15px', color: '#ffdd00' }).setOrigin(0.5);
    this.shardText = this.add.text(520, 70, `🌠 ${PLAYER_DATA.summonShards || 0}`, { fontSize: '15px', color: '#ff88ff' }).setOrigin(0.5);

    this.cardDisplay = this.add.rectangle(400, 225, 150, 190, 0x222233).setStrokeStyle(2, 0x555577);
    this.cardText = this.add.text(400, 205, 'Faites un pacte !', { fontSize: '15px', color: '#888888' }).setOrigin(0.5);
    this.rarityText = this.add.text(400, 240, '', { fontSize: '18px', fontStyle: 'bold' }).setOrigin(0.5);
    this.levelText = this.add.text(400, 268, '', { fontSize: '12px', color: '#00ffaa' }).setOrigin(0.5);

    // --- Pacte Doré ---
    this.add.text(190, 340, 'PACTE DORÉ', { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(190, 356, formatRates(GOLD_RARITY_WEIGHTS), { fontSize: '9px', color: '#dddddd' }).setOrigin(0.5);
    this.makeSummonButton(190, 388, `x1 (${GOLD_COST_EACH} Or)`, 0x8800aa, () => this.drawSummon('gold', 1));
    this.makeSummonButton(190, 432, `x10 (${GOLD_COST_EACH * 10} Or)`, 0x8800aa, () => this.drawSummon('gold', 10));

    // --- Pacte Supérieur ---
    this.add.text(610, 340, 'PACTE SUPÉRIEUR', { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(610, 356, formatRates(SHARD_RARITY_WEIGHTS), { fontSize: '9px', color: '#ffccff' }).setOrigin(0.5);
    this.makeSummonButton(610, 388, `x1 (${SHARD_COST_EACH} 🌠)`, 0x662299, () => this.drawSummon('shard', 1));
    this.makeSummonButton(610, 432, `x10 (${SHARD_COST_EACH * 10} 🌠)`, 0x662299, () => this.drawSummon('shard', 10));

    // --- Billet de Pacte (objet du Reliquaire) ---
    this.ticketBtn = this.makeSummonButton(400, 462, '', 0x774411, () => this.useTicket());
    this.updateTicketButton();

    this.add.text(400, 496, "Les Éclats de Pacte Supérieur s'obtiennent en battant des BOSS.", {
      fontSize: '11px', color: '#8d94a3'
    }).setOrigin(0.5);

    this.logText = this.add.text(400, 518, '', { fontSize: '13px', color: '#ff4444' }).setOrigin(0.5);
  }

  makeSummonButton(x, y, label, color, onClick) {
    const btn = this.add.rectangle(x, y, 210, 36, color).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff);
    const text = this.add.text(x, y, label, { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    btn.on('pointerover', () => btn.setAlpha(0.85));
    btn.on('pointerout', () => btn.setAlpha(1));
    btn.on('pointerdown', onClick);
    return { btn, text };
  }


  updateTicketButton() {
    const count = getItemCount('pact_ticket');
    this.ticketBtn.text.setText(`🎫 Utiliser un Billet de Pacte (x${count})`);
    this.ticketBtn.btn.setFillStyle(count > 0 ? 0x774411 : 0x333333);
  }

  useTicket() {
    if (!spendItem('pact_ticket', 1)) {
      this.logText.setText("Aucun Billet de Pacte disponible.");
      return;
    }
    saveGameData();
    this.updateTicketButton();

    const drawnKey = this.pickWeightedKey(GOLD_RARITY_WEIGHTS);
    if (!drawnKey) {
      this.logText.setText('Aucune unité disponible à invoquer !');
      return;
    }
    const unit = UNITS_DATABASE[drawnKey];
    const instance = createUnitInstance(drawnKey);
    PLAYER_DATA.inventory.push(instance);
    saveGameData();
    this.logText.setText('');
    this.revealSingle(unit);
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

  drawSummon(pactType, count) {
    const isShardPact = pactType === 'shard';
    const costEach = isShardPact ? SHARD_COST_EACH : GOLD_COST_EACH;
    const totalCost = costEach * count;
    const currency = isShardPact ? (PLAYER_DATA.summonShards || 0) : PLAYER_DATA.gold;

    if (currency < totalCost) {
      this.logText.setText(isShardPact ? `Pas assez d'Éclats ! (${totalCost} requis)` : `Pas assez d'or ! (${totalCost} requis)`);
      return;
    }

    const weights = isShardPact ? SHARD_RARITY_WEIGHTS : GOLD_RARITY_WEIGHTS;
    const results = [];
    for (let i = 0; i < count; i++) {
      const drawnKey = this.pickWeightedKey(weights);
      if (!drawnKey) break;
      const instance = createUnitInstance(drawnKey);
      PLAYER_DATA.inventory.push(instance);
      results.push(UNITS_DATABASE[drawnKey]);
    }

    if (results.length === 0) {
      this.logText.setText('Aucune unité disponible à invoquer !');
      return;
    }

    if (isShardPact) {
      PLAYER_DATA.summonShards -= results.length;
    } else {
      PLAYER_DATA.gold -= results.length * costEach;
    }
    saveGameData();

    this.goldText.setText(`💰 ${PLAYER_DATA.gold}`);
    this.shardText.setText(`🌠 ${PLAYER_DATA.summonShards || 0}`);
    this.logText.setText('');

    if (count === 1) {
      this.revealSingle(results[0]);
    } else {
      this.showMultiResults(results);
    }
  }

  revealSingle(unit) {
    this.tweens.add({
      targets: this.cardDisplay,
      scaleX: 0,
      duration: 150,
      yoyo: true,
      onYoyo: () => {
        this.cardDisplay.setFillStyle(unit.color);
        this.cardText.setText(unit.name).setColor('#ffffff');
        this.rarityText.setText(`[${unit.rarity}]`).setColor(RARITY_COLORS[unit.rarity] || '#ffffff');
        this.levelText.setText(`Niveau 1  •  0 XP  •  ${ELEMENT_LABELS[unit.element] || ''}`);
      }
    });
  }

  /** Affiche les unités obtenues en grille, inspectables individuellement. */
  showMultiResults(results) {
    if (this.resultsContainer) this.resultsContainer.destroy();
    this.resultsContainer = this.add.container(0, 0).setDepth(150);

    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9).setInteractive();
    const title = this.add.text(400, 40, `✨ ${results.length} INVOCATIONS !`, { fontSize: '22px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);

    this.resultsContainer.add([overlay, title]);

    results.forEach((unit, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const x = 90 + col * 155;
      const y = 150 + row * 195;

      const card = this.add.rectangle(x, y, 135, 175, unit.color).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
      const nameText = this.add.text(x, y - 62, unit.name, { fontSize: '11px', color: '#ffffff', fontStyle: 'bold', align: 'center', wordWrap: { width: 120 } }).setOrigin(0.5);
      const rarityText = this.add.text(x, y - 5, `[${unit.rarity}]`, { fontSize: '15px', color: RARITY_COLORS[unit.rarity] || '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
      const elementText = this.add.text(x, y + 18, ELEMENT_LABELS[unit.element] || '', { fontSize: '10px', color: '#dddddd' }).setOrigin(0.5);
      const tapText = this.add.text(x, y + 72, 'Toucher pour inspecter', { fontSize: '8px', color: '#333333' }).setOrigin(0.5);

      card.on('pointerover', () => card.setAlpha(0.85));
      card.on('pointerout', () => card.setAlpha(1));
      card.on('pointerdown', () => this.showResultDetail(unit));

      this.resultsContainer.add([card, nameText, rarityText, elementText, tapText]);
    });

    const closeBtn = this.add.rectangle(400, 565, 220, 40, 0x226633).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
    const closeText = this.add.text(400, 565, 'CONTINUER', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    closeBtn.on('pointerdown', () => {
      this.resultsContainer.destroy();
      this.resultsContainer = null;
    });
    this.resultsContainer.add([closeBtn, closeText]);
  }

  /** Détail complet d'une unité obtenue, pour l'inspecter avant de fermer l'écran de résultats. */
  showResultDetail(unit) {
    if (this.detailModal) this.detailModal.destroy();
    this.detailModal = this.add.container(0, 0).setDepth(250);

    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setInteractive();
    const panel = this.add.rectangle(400, 300, 360, 400, 0x1a1d28).setStrokeStyle(2, 0xffffff);

    const title = this.add.text(400, 150, unit.name, { fontSize: '20px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);
    const rarityLine = this.add.text(400, 176, `[${unit.rarity}]  •  ${ELEMENT_LABELS[unit.element] || ''}`, { fontSize: '13px', color: '#88ddff' }).setOrigin(0.5);

    const statsStr = `❤️ HP : ${unit.hp}\n⚔️ ATK : ${unit.atk}\n🔮 WIS : ${unit.wis}\n🛡️ DEF : ${unit.def}\n💨 AGI : ${unit.agi}`;
    const statsText = this.add.text(400, 205, statsStr, { fontSize: '14px', color: '#ffffff', align: 'center', lineSpacing: 6 }).setOrigin(0.5, 0);

    const skillTitle = this.add.text(400, 375, `Compétence : ${unit.skill ? unit.skill.name : 'Aucune'}`, { fontSize: '13px', color: '#00ffff', fontStyle: 'bold' }).setOrigin(0.5);
    const skillDesc = this.add.text(400, 400, unit.skill ? `Chances de déclenchement : ${unit.skill.chance * 100}%` : '', { fontSize: '12px', color: '#cccccc' }).setOrigin(0.5);

    const closeBtn = this.add.rectangle(400, 450, 140, 35, 0xaa2222).setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true });
    const closeText = this.add.text(400, 450, 'Fermer', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    closeBtn.on('pointerdown', () => this.detailModal.destroy());
    overlay.on('pointerdown', () => this.detailModal.destroy());

    this.detailModal.add([overlay, panel, title, rarityLine, statsText, skillTitle, skillDesc, closeBtn, closeText]);
  }
}