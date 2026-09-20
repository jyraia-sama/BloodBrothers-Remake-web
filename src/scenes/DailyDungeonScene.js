import { PLAYER_DATA, getDailyDungeonTimeLeft, consumeDailyDungeonRun } from '../saveSystem.js';
import { buildDailyDungeonChapter, UNITS_DATABASE } from '../database.js';

export class DailyDungeonScene extends Phaser.Scene {
  constructor() { super({ key: 'DailyDungeonScene' }); }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x1a1430);
    this.add.text(400, 45, 'DONJON QUOTIDIEN', { fontSize: '26px', color: '#cc99ff', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Actes', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('ChapterSelectScene'));

    this.dungeon = buildDailyDungeonChapter();
    const boss = UNITS_DATABASE[this.dungeon.bossUnit];

    this.add.text(400, 95, 'Un défi gratuit, identique pour tous aujourd\'hui.', { fontSize: '12px', color: '#aaaaaa' }).setOrigin(0.5);

    // --- Aperçu du boss du jour ---
    this.add.rectangle(400, 210, 180, 220, boss.color).setStrokeStyle(3, 0xffffff);
    this.add.text(400, 130, 'Garde du jour', { fontSize: '12px', color: '#cccccc' }).setOrigin(0.5);
    this.add.text(400, 150, boss.name, { fontSize: '17px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(400, 260, `❤️ ${boss.hp}   ⚔️ ${boss.atk}   🛡️ ${boss.def}`, { fontSize: '12px', color: '#ffdd00' }).setOrigin(0.5);

    // --- Récompenses ---
    this.add.text(400, 345, `🪙 +${this.dungeon.rewardGold} Or   •   ⭐ +${this.dungeon.rewardXpBonus} XP`, { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(400, 368, '20% de chance d\'obtenir un Éclat de Pacte Supérieur', { fontSize: '11px', color: '#ff88ff' }).setOrigin(0.5);

    // --- Tentatives restantes ---
    this.runsText = this.add.text(400, 410, '', { fontSize: '14px', color: '#00ffaa', fontStyle: 'bold' }).setOrigin(0.5);
    this.resetText = this.add.text(400, 432, '', { fontSize: '11px', color: '#8d94a3' }).setOrigin(0.5);

    // --- Bouton de combat ---
    this.fightBtn = this.add.rectangle(400, 490, 260, 50, 0x662299).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
    this.fightText = this.add.text(400, 490, 'COMBATTRE (Gratuit)', { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    this.fightBtn.on('pointerover', () => this.fightBtn.setAlpha(0.85));
    this.fightBtn.on('pointerout', () => this.fightBtn.setAlpha(1));
    this.fightBtn.on('pointerdown', () => this.startFight());

    this.logText = this.add.text(400, 545, '', { fontSize: '12px', color: '#ff4444' }).setOrigin(0.5);

    this.updateRunsDisplay();
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.updateRunsDisplay() });
  }

  updateRunsDisplay() {
    const runsLeft = PLAYER_DATA.dailyDungeonRunsLeft;
    this.runsText.setText(`Tentatives restantes : ${runsLeft} / 3`);

    if (runsLeft <= 0) {
      const msLeft = getDailyDungeonTimeLeft();
      const h = Math.floor(msLeft / 3600000);
      const m = Math.floor((msLeft % 3600000) / 60000);
      const s = Math.floor((msLeft % 60000) / 1000);
      this.resetText.setText(`Prochain reset dans : ${h}h ${m}m ${s}s`);
      this.fightBtn.setFillStyle(0x333333);
      this.fightText.setText('PLUS DE TENTATIVES').setColor('#888888');
    } else {
      this.resetText.setText('');
      this.fightBtn.setFillStyle(0x662299);
      this.fightText.setText('COMBATTRE (Gratuit)').setColor('#ffffff');
    }
  }

  startFight() {
    if (PLAYER_DATA.deck.length === 0) {
      this.logText.setText('⚠️ Deck vide ! Équipez des unités avant de combattre.');
      return;
    }
    if (!consumeDailyDungeonRun()) {
      this.logText.setText('Plus de tentatives aujourd\'hui. Revenez demain !');
      return;
    }

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('BattleScene', { mode: 'daily', isBoss: true, chapter: this.dungeon });
    });
  }
}