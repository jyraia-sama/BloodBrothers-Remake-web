import { PLAYER_DATA, saveGameData, getDeckInstances } from '../saveSystem.js';
import { UNITS_DATABASE, CHAPTERS_DATABASE } from '../database.js';
import {
  getInstanceStats, addXP, xpRewardForBattle, MAX_LEVEL,
  addAccountXP, accountXpRewardForBattle
} from '../levelSystem.js';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
    this.gameSpeed = 1;
    this.combatLogs = [];
  }

  init(data) {
    this.isBossCombat = data ? data.isBoss : false;
    this.chapter = data ? data.chapter : CHAPTERS_DATABASE[0];
    this.gameSpeed = 1;
    this.combatLogs = [];
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x111122);

    const title = this.isBossCombat ? `BOSS : ${UNITS_DATABASE[this.chapter.bossUnit].name}` : 'COMBAT DE ZONE';
    this.add.text(300, 30, title, { fontSize: '22px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5);

    this.speedBtn = this.add.rectangle(520, 30, 110, 32, 0x333355).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.speedText = this.add.text(520, 30, '⚡ Vitesse: x1', { fontSize: '12px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    this.speedBtn.on('pointerdown', () => {
      if (this.gameSpeed === 1) this.gameSpeed = 2;
      else if (this.gameSpeed === 2) this.gameSpeed = 4;
      else this.gameSpeed = 1;
      this.speedText.setText(`⚡ Vitesse: x${this.gameSpeed}`);
    });

    this.add.rectangle(690, 300, 200, 560, 0x1a1a2e).setStrokeStyle(1, 0x444466);
    this.add.rectangle(690, 40, 200, 40, 0x222244).setStrokeStyle(1, 0x444466);
    this.add.text(690, 40, 'HISTORIQUE', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    this.historyText = this.add.text(600, 70, '', {
      fontSize: '11px',
      color: '#cccccc',
      wordWrap: { width: 180 },
      lineSpacing: 4
    });

    // --- Équipe du joueur : stats calculées depuis les instances (niveau + fusions) ---
    this.deckInstances = getDeckInstances();
    this.playerTeam = this.deckInstances.map(instance => {
      const base = UNITS_DATABASE[instance.unitKey];
      return {
        ...getInstanceStats(base, instance),
        side: 'player',
        instanceId: instance.instanceId
      };
    });

    if (this.playerTeam.length === 0) {
      this.add.text(300, 300, 'Votre deck est vide !\nÉquipez des unités avant de combattre.', {
        fontSize: '16px', color: '#ff4444', align: 'center'
      }).setOrigin(0.5);
      this.time.delayedCall(2000, () => this.scene.start('DeckScene'));
      return;
    }

    // --- Équipe ennemie (les ennemis utilisent leurs stats de base) ---
    if (this.isBossCombat) {
      const minionKey = Phaser.Utils.Array.GetRandom(this.chapter.enemyPool);
      this.enemyTeam = [
        { ...UNITS_DATABASE[minionKey], side: 'enemy' },
        { ...UNITS_DATABASE[this.chapter.bossUnit], side: 'enemy' },
        { ...UNITS_DATABASE[minionKey], side: 'enemy' }
      ];
    } else {
      this.enemyTeam = [1, 2, 3].map(() => ({
        ...UNITS_DATABASE[Phaser.Utils.Array.GetRandom(this.chapter.enemyPool)],
        side: 'enemy'
      }));
    }

    this.renderTeam(this.playerTeam, 80, 450, true);
    this.renderTeam(this.enemyTeam, 120, 150, false);

    this.logText = this.add.text(300, 300, 'Préparation au combat...', { fontSize: '16px', color: '#ffcc00' }).setOrigin(0.5);
    this.addLog('--- Début du combat ---');

    this.isCombatActive = false;
    this.time.delayedCall(1000 / this.gameSpeed, () => this.startTurn());
  }

  addLog(message) {
    this.combatLogs.push(message);
    if (this.combatLogs.length > 18) {
      this.combatLogs.shift();
    }
    this.historyText.setText(this.combatLogs.join('\n'));
  }

  renderTeam(team, startX, startY, showLevel) {
    const spacing = 100;
    team.forEach((unit, index) => {
      const x = startX + index * spacing;
      const card = this.add.rectangle(x, startY, 80, 100, unit.color).setStrokeStyle(2, 0xffffff);
      unit.cardGraphics = card;
      this.add.text(x, startY - 32, unit.name.split(' ')[0], { fontSize: '11px', color: '#fff' }).setOrigin(0.5);
      if (showLevel && unit.level) {
        this.add.text(x, startY - 16, `Nv. ${unit.level}`, { fontSize: '10px', color: '#00ffaa' }).setOrigin(0.5);
      }
      unit.hpText = this.add.text(x, startY + 30, `${unit.hp}/${unit.maxHp}`, { fontSize: '11px', color: '#00ff00' }).setOrigin(0.5);
    });
  }

  async startTurn() {
    if (this.isCombatActive) return;
    this.isCombatActive = true;

    let allUnits = [...this.playerTeam, ...this.enemyTeam].filter(u => u.hp > 0).sort((a, b) => b.agi - a.agi);

    for (let attacker of allUnits) {
      if (attacker.hp <= 0) continue;
      const allies = (attacker.side === 'player' ? this.playerTeam : this.enemyTeam).filter(u => u.hp > 0);
      const targets = (attacker.side === 'player' ? this.enemyTeam : this.playerTeam).filter(u => u.hp > 0);
      if (targets.length === 0) break;

      const triggerSkill = attacker.skill && Math.random() < attacker.skill.chance;
      if (triggerSkill) {
        await this.executeSkill(attacker, allies, targets);
      } else {
        await this.executeAttack(attacker, Phaser.Utils.Array.GetRandom(targets));
      }
    }

    const playerAlive = this.playerTeam.some(u => u.hp > 0);
    const enemyAlive = this.enemyTeam.some(u => u.hp > 0);

    if (enemyAlive && playerAlive) {
      this.isCombatActive = false;
      this.time.delayedCall(500 / this.gameSpeed, () => this.startTurn());
    } else {
      this.endBattle(playerAlive);
    }
  }

  executeAttack(attacker, target) {
    return new Promise((resolve) => {
      let damage = Math.max(15, attacker.atk - Math.floor(target.def / 2));
      target.hp = Math.max(0, target.hp - damage);

      const msg = `${attacker.name} touche ${target.name} (-${damage} HP)`;
      this.logText.setText(msg).setColor('#ffcc00');
      this.addLog(`• ${msg}`);

      this.tweens.add({
        targets: attacker.cardGraphics,
        y: attacker.cardGraphics.y + (attacker.side === 'player' ? -20 : 20),
        duration: 120 / this.gameSpeed,
        yoyo: true,
        onComplete: () => {
          this.updateUnitUI(target);
          this.time.delayedCall(300 / this.gameSpeed, resolve);
        }
      });
    });
  }

  executeSkill(attacker, allies, targets) {
    return new Promise((resolve) => {
      const skill = attacker.skill;
      this.logText.setText(`✨ ${attacker.name} lance : ${skill.name} !`).setColor('#00ffff');
      this.addLog(`✨ ${attacker.name} : ${skill.name}`);

      this.tweens.add({
        targets: attacker.cardGraphics,
        scaleX: 1.15, scaleY: 1.15, duration: 150 / this.gameSpeed, yoyo: true,
        onComplete: () => {
          if (skill.type === 'damage_single') {
            const target = Phaser.Utils.Array.GetRandom(targets);
            let damage = Math.max(20, Math.floor((attacker.atk * skill.multiplier) - (target.def / 2)));
            target.hp = Math.max(0, target.hp - damage);
            this.addLog(`  -> ${target.name} subit ${damage} dégâts`);
            this.updateUnitUI(target);
          } else if (skill.type === 'damage_aoe') {
            targets.forEach(t => {
              let damage = Math.max(10, Math.floor((attacker.atk * skill.multiplier) - (t.def / 2)));
              t.hp = Math.max(0, t.hp - damage);
              this.updateUnitUI(t);
            });
            this.addLog(`  -> Dégâts de zone appliqués`);
          } else if (skill.type === 'heal_team') {
            allies.forEach(a => {
              a.hp = Math.min(a.maxHp, a.hp + skill.power);
              this.updateUnitUI(a);
            });
            this.addLog(`  -> Équipe soignée (+${skill.power} HP)`);
          } else if (skill.type === 'heal_lowest') {
            let lowestAlly = allies.reduce((lowest, current) => {
              return (current.hp / current.maxHp) < (lowest.hp / lowest.maxHp) ? current : lowest;
            }, allies[0]);

            if (lowestAlly) {
              lowestAlly.hp = Math.min(lowestAlly.maxHp, lowestAlly.hp + skill.power);
              this.updateUnitUI(lowestAlly);
              this.addLog(`  -> ${lowestAlly.name} soigné (+${skill.power} HP)`);
            }
          } else if (skill.type === 'buff_atk') {
            allies.forEach(a => { a.atk += skill.amount; });
            this.addLog(`  -> Attaque de l'équipe augmentée`);
          }
          this.time.delayedCall(500 / this.gameSpeed, resolve);
        }
      });
    });
  }

  updateUnitUI(unit) {
    unit.hpText.setText(`${unit.hp}/${unit.maxHp}`);
    if (unit.hp <= 0) {
      unit.cardGraphics.setAlpha(0.3);
      unit.hpText.setText('K.O.').setColor('#ff0000');
      this.addLog(`💀 ${unit.name} est K.O.`);
    }
  }

  /** Distribue l'XP aux unités survivantes et gère les montées de niveau. */
  grantExperience() {
    const xpGain = xpRewardForBattle(this.chapter, this.isBossCombat);
    const survivorIds = this.playerTeam.filter(u => u.hp > 0).map(u => u.instanceId);

    this.deckInstances.forEach(instance => {
      if (!survivorIds.includes(instance.instanceId)) return;
      if (instance.level >= MAX_LEVEL) return;

      const levelsGained = addXP(instance, xpGain);
      const baseName = UNITS_DATABASE[instance.unitKey].name;

      if (levelsGained > 0) {
        this.addLog(`⬆️ ${baseName} passe Nv. ${instance.level} !`);
      }
    });

    this.addLog(`⭐ +${xpGain} XP pour les survivants`);

    // --- XP de compte (progression globale, augmente la stamina max) ---
    const accountGain = accountXpRewardForBattle(this.chapter, this.isBossCombat);
    const accountLevelsGained = addAccountXP(PLAYER_DATA, accountGain);

    if (accountLevelsGained > 0) {
      this.addLog(`🎖️ COMPTE Nv. ${PLAYER_DATA.accountLevel} ! Stamina max : ${PLAYER_DATA.maxStamina}`);
    }

    return xpGain;
  }

  endBattle(playerWon) {
    if (playerWon) {
      const reward = this.isBossCombat ? this.chapter.rewardGold : 50;
      PLAYER_DATA.gold += reward;

      const xpGain = this.grantExperience();

      let victoryMsg = `VICTOIRE ! +${reward} Or, +${xpGain} XP.`;

      if (this.isBossCombat) {
        const isFinalChapter = this.chapter.id >= CHAPTERS_DATABASE.length;
        const reachedOrPastFrontier = this.chapter.id >= PLAYER_DATA.unlockedChapter;

        if (reachedOrPastFrontier && !isFinalChapter) {
          PLAYER_DATA.unlockedChapter = Math.max(PLAYER_DATA.unlockedChapter, this.chapter.id + 1);
          PLAYER_DATA.currentChapter = PLAYER_DATA.unlockedChapter;
          PLAYER_DATA.currentTileId = 0;
          victoryMsg = `VICTOIRE ! Nouveau chapitre débloqué ! (+${xpGain} XP)`;
        } else if (isFinalChapter) {
          PLAYER_DATA.currentTileId = this.chapter.tiles.length - 1;
          victoryMsg = `VICTOIRE ! Jeu terminé ! (+${xpGain} XP)`;
        } else {
          PLAYER_DATA.currentTileId = 0;
        }

        // --- Drop de boss : chance d'obtenir un Éclat de Pacte Supérieur ---
        const SHARD_DROP_CHANCE = 0.2;
        if (Math.random() < SHARD_DROP_CHANCE) {
          PLAYER_DATA.summonShards = (PLAYER_DATA.summonShards || 0) + 1;
          victoryMsg += ` 🌠 Le boss a lâché un Éclat de Pacte Supérieur !`;
          this.addLog('🌠 Objet obtenu : Éclat de Pacte Supérieur');
        }
      }

      saveGameData();
      this.logText.setText(victoryMsg).setColor('#00ff00');
      this.addLog(`🏆 ${victoryMsg}`);
    } else {
      this.logText.setText('DÉFAITE...').setColor('#ff0000');
      this.addLog('☠️ Défaite de votre équipe...');
    }

    this.time.delayedCall(2000 / this.gameSpeed, () => {
      this.cameras.main.fadeOut(1000 / this.gameSpeed, 0, 0, 0);
      this.time.delayedCall(1000 / this.gameSpeed, () => {
        if (this.isBossCombat) {
          this.scene.start('ChapterSelectScene', { actId: this.chapter.actId });
        } else {
          this.scene.start('MapScene');
        }
      });
    });
  }
}