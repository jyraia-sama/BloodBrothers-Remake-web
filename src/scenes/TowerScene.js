import { PLAYER_DATA, saveGameData, getTowerResetTimeLeft } from '../saveSystem.js';
import { getTowerFloorData, UNITS_DATABASE, TOWER_MAX_FLOOR } from '../database.js';

const TOWER_STAMINA_COST = 2;

export class TowerScene extends Phaser.Scene {
  constructor() { super({ key: 'TowerScene' }); }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x0f0f22);
    this.add.text(400, 40, 'TOUR SANS FIN', { fontSize: '26px', color: '#88aaff', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Actes', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('ChapterSelectScene'));

    const highest = PLAYER_DATA.towerHighestFloor || 0;
    const nextFloor = Math.min(TOWER_MAX_FLOOR, highest + 1);
    const towerCleared = highest >= TOWER_MAX_FLOOR;

    this.add.text(400, 80, `Étage le plus haut atteint : ${highest} / ${TOWER_MAX_FLOOR}`, { fontSize: '13px', color: '#aaaaaa' }).setOrigin(0.5);

    const daysLeft = Math.ceil(getTowerResetTimeLeft() / (24 * 60 * 60 * 1000));
    this.add.text(400, 118, `🔄 Réinitialisation de la Tour dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`, { fontSize: '10px', color: '#6688cc' }).setOrigin(0.5);

    // --- Barre de progression globale ---
    this.add.rectangle(400, 105, 400, 10, 0x0d1018).setStrokeStyle(1, 0x3a3f4b);
    const progress = highest / TOWER_MAX_FLOOR;
    this.add.rectangle(200, 105, Math.max(1, 400 * progress), 10, 0x6699ff).setOrigin(0, 0.5);

    if (towerCleared) {
      this.add.text(400, 250, '🏆 Vous avez conquis les 100 étages !', { fontSize: '18px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(400, 280, 'Revenez après une future mise à jour pour de nouveaux défis.', { fontSize: '12px', color: '#aaaaaa' }).setOrigin(0.5);
      return;
    }

    const floorData = getTowerFloorData(nextFloor);
    const boss = UNITS_DATABASE[floorData.bossUnit];
    const enemyPreview = floorData.enemyPool.map(k => UNITS_DATABASE[k].name).join(', ');

    this.add.text(400, 145, `PROCHAIN ÉTAGE : ${nextFloor}`, { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    if (floorData.isBossFloor) {
      this.add.text(400, 168, `⚠️ Étage de BOSS : ${boss.name}`, { fontSize: '12px', color: '#ff8888' }).setOrigin(0.5);
    } else {
      this.add.text(400, 168, `Ennemis : ${enemyPreview}`, { fontSize: '11px', color: '#cccccc', wordWrap: { width: 600 }, align: 'center' }).setOrigin(0.5);
    }
    this.add.text(400, 190, `Difficulté : x${floorData.statMultiplier.toFixed(2)} par rapport aux stats de base`, { fontSize: '11px', color: '#ffaa66' }).setOrigin(0.5);

    this.add.text(400, 230, `🪙 +${floorData.rewardGold} Or   •   ⭐ +${floorData.rewardXpBonus} XP`, { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    if (floorData.isBossFloor) {
      this.add.text(400, 252, '20% de chance d\'obtenir un Éclat de Pacte Supérieur', { fontSize: '11px', color: '#ff88ff' }).setOrigin(0.5);
    }

    // --- Aperçu visuel du boss (uniquement sur un étage de boss) ---
    if (floorData.isBossFloor) {
      this.add.rectangle(400, 340, 130, 150, boss.color).setStrokeStyle(3, 0xffffff);
    }

    this.staminaText = this.add.text(400, 430, '', { fontSize: '13px', color: '#ffcc00' }).setOrigin(0.5);
    this.updateStaminaText();

    this.fightBtn = this.add.rectangle(400, 480, 300, 50, 0x334488).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
    this.fightText = this.add.text(400, 480, `COMBATTRE (-${TOWER_STAMINA_COST} Stamina)`, { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    this.fightBtn.on('pointerover', () => this.fightBtn.setAlpha(0.85));
    this.fightBtn.on('pointerout', () => this.fightBtn.setAlpha(1));
    this.fightBtn.on('pointerdown', () => this.startFight(nextFloor, floorData));

    this.logText = this.add.text(400, 540, '', { fontSize: '12px', color: '#ff4444' }).setOrigin(0.5);
  }

  updateStaminaText() {
    const staminaDisplay = PLAYER_DATA.adminStaminaActive ? '∞' : PLAYER_DATA.stamina;
    this.staminaText.setText(`⚡ Stamina : ${staminaDisplay}/${PLAYER_DATA.maxStamina}`);
  }

  startFight(floor, floorData) {
    if (PLAYER_DATA.deck.length === 0) {
      this.logText.setText('⚠️ Deck vide ! Équipez des unités avant de combattre.');
      return;
    }
    if (!PLAYER_DATA.adminStaminaActive && PLAYER_DATA.stamina < TOWER_STAMINA_COST) {
      this.logText.setText('⚠️ Pas assez de Stamina !');
      return;
    }

    if (!PLAYER_DATA.adminStaminaActive) {
      PLAYER_DATA.stamina -= TOWER_STAMINA_COST;
    }
    saveGameData();

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('BattleScene', { mode: 'tower', isBoss: floorData.isBossFloor, chapter: floorData });
    });
  }
}