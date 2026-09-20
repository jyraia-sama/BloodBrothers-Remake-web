import { PLAYER_DATA, saveGameData, getDeckInstances, getEquippedEchoes, addItem, addHeroFragments } from '../saveSystem.js';
import { UNITS_DATABASE, CHAPTERS_DATABASE, getTowerFloorData, TOWER_MAX_FLOOR, FRAGMENT_ELIGIBLE_KEYS } from '../database.js';
import {
  getInstanceStats, addXP, xpRewardForBattle, MAX_LEVEL,
  addAccountXP, accountXpRewardForBattle
} from '../levelSystem.js';
import { getElementMultiplier, ELEMENT_ICONS, FRONT_ROW_SIZE } from '../elements.js';
import { applyEchoesToStats, createEcho } from '../echoSystem.js';
import { ECHO_SETS } from '../EchoData.js';
import { getSetEssenceKey } from '../ItemData.js';

const NIGHTMARE_STAT_MULTIPLIER = 1.8;
const NIGHTMARE_GOLD_MULTIPLIER = 2;
const NIGHTMARE_XP_MULTIPLIER = 1.5;

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
    this.gameSpeed = 1;
    this.combatLogs = [];
  }

  init(data) {
    this.mode = (data && data.mode) || 'chapter'; // 'chapter' | 'daily' | 'tower'
    this.isBossCombat = data ? data.isBoss : false;
    this.chapter = data ? data.chapter : CHAPTERS_DATABASE[0];
    this.nightmare = this.mode === 'chapter' && !!PLAYER_DATA.nightmareMode;
    this.gameSpeed = 1;
    this.combatLogs = [];
    this.lastPlayerWon = false;
  }

  /** Multiplicateur appliqué aux stats ennemies : Tour (par étage) ou Mode Cauchemar. */
  getEnemyStatMultiplier() {
    if (this.mode === 'tower') return this.chapter.statMultiplier || 1;
    if (this.nightmare) return NIGHTMARE_STAT_MULTIPLIER;
    return 1;
  }

  /** Applique le multiplicateur de difficulté aux stats de base d'un ennemi. */
  scaleEnemy(base) {
    const mult = this.getEnemyStatMultiplier();
    if (mult === 1) return { ...base };
    return {
      ...base,
      hp: Math.round(base.hp * mult),
      maxHp: Math.round(base.hp * mult),
      atk: Math.round(base.atk * mult),
      def: Math.round(base.def * mult)
    };
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x111122);

    const modeTag = this.nightmare ? ' 💀 CAUCHEMAR' : this.mode === 'tower' ? ` — Étage ${this.chapter.floor}` : this.mode === 'daily' ? ' — Donjon Quotidien' : '';
    const title = this.isBossCombat ? `BOSS : ${UNITS_DATABASE[this.chapter.bossUnit].name}${modeTag}` : `COMBAT DE ZONE${modeTag}`;
    this.add.text(300, 30, title, { fontSize: '18px', color: this.nightmare ? '#ff2244' : '#ff4444', fontStyle: 'bold' }).setOrigin(0.5);

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

    // --- Équipe du joueur : stats calculées depuis les instances (niveau + fusions + Échos) ---
    this.deckInstances = getDeckInstances();
    this.playerTeam = this.deckInstances.map((instance, index) => {
      const base = UNITS_DATABASE[instance.unitKey];
      const leveledStats = { ...getInstanceStats(base, instance), side: 'player', instanceId: instance.instanceId, position: index < FRONT_ROW_SIZE ? 'front' : 'back' };
      const equippedEchoes = getEquippedEchoes(instance.instanceId);
      const finalStats = applyEchoesToStats(leveledStats, equippedEchoes);
      return { ...leveledStats, ...finalStats };
    });

    // --- Bouclier d'équipe (set Shield) : 3 tours, basé sur les PV du porteur ---
    this.teamShield = { amount: 0, turnsLeft: 0 };
    this.playerTeam.forEach(unit => {
      if (unit.activeSets && unit.activeSets.includes('shield')) {
        const shieldAmount = Math.round(unit.maxHp * 0.3);
        if (shieldAmount > this.teamShield.amount) {
          this.teamShield = { amount: shieldAmount, turnsLeft: 3 };
        }
      }
    });

    if (this.playerTeam.length === 0) {
      this.add.text(300, 300, 'Votre deck est vide !\nÉquipez des unités avant de combattre.', {
        fontSize: '16px', color: '#ff4444', align: 'center'
      }).setOrigin(0.5);
      this.time.delayedCall(2000, () => this.scene.start('DeckScene'));
      return;
    }

    // --- Équipe ennemie (échelle selon la Tour ou le Mode Cauchemar) ---
    if (this.isBossCombat) {
      const minionKey = Phaser.Utils.Array.GetRandom(this.chapter.enemyPool);
      this.enemyTeam = [
        { ...this.scaleEnemy(UNITS_DATABASE[minionKey]), side: 'enemy', position: 'front' },
        { ...this.scaleEnemy(UNITS_DATABASE[minionKey]), side: 'enemy', position: 'front' },
        { ...this.scaleEnemy(UNITS_DATABASE[this.chapter.bossUnit]), side: 'enemy', position: 'back' }
      ];
    } else {
      this.enemyTeam = [1, 2, 3].map((_, index) => ({
        ...this.scaleEnemy(UNITS_DATABASE[Phaser.Utils.Array.GetRandom(this.chapter.enemyPool)]),
        side: 'enemy',
        position: index < FRONT_ROW_SIZE ? 'front' : 'back'
      }));
    }

    this.renderTeam(this.playerTeam, 80, 450, true);
    this.renderTeam(this.enemyTeam, 120, 150, false);

    this.logText = this.add.text(300, 300, 'Préparation au combat...', {
      fontSize: '16px', color: '#ffcc00', align: 'center', wordWrap: { width: 420 }
    }).setOrigin(0.5);
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
      const elementIcon = ELEMENT_ICONS[unit.element] || '';
      const posLabel = unit.position === 'front' ? 'AVANT' : 'ARRIÈRE';
      this.add.text(x, startY - 44, `${elementIcon} ${posLabel}`, { fontSize: '9px', color: unit.position === 'front' ? '#ff8888' : '#88aaff' }).setOrigin(0.5);
      if (unit.activeSets && unit.activeSets.length > 0) {
        const setIcons = { violent: '⚡', swift: '💨', fatal: '💥', vampire: '🩸', energy: '🔋', guard: '🛡️', shield: '🔰' };
        const icons = unit.activeSets.map(s => setIcons[s] || '').join('');
        this.add.text(x, startY + 44, icons, { fontSize: '11px' }).setOrigin(0.5);
      }
      unit.hpText = this.add.text(x, startY + 30, `${unit.hp}/${unit.maxHp}`, { fontSize: '11px', color: '#00ff00' }).setOrigin(0.5);
    });
  }

  /**
   * Cible en priorité un adversaire en Avant ; l'Arrière n'est visé que si l'Avant est vide.
   * Côté ennemi, le ciblage est intelligent : achève une cible sous 30% PV si possible,
   * sinon vise la cible la plus fragile (DEF la plus faible) du groupe prioritaire.
   * Côté joueur, le ciblage reste aléatoire dans le groupe prioritaire (contrôle au joueur).
   */
  pickPriorityTarget(team, attacker) {
    const alive = team.filter(u => u.hp > 0);
    if (alive.length === 0) return null;
    const front = alive.filter(u => u.position === 'front');
    const pool = front.length > 0 ? front : alive;

    if (attacker && attacker.side === 'enemy') {
      const nearDeath = pool.filter(u => u.hp / u.maxHp <= 0.3);
      if (nearDeath.length > 0) {
        return nearDeath.reduce((weakest, u) => (u.hp < weakest.hp ? u : weakest));
      }
      return pool.reduce((frailest, u) => (u.def < frailest.def ? u : frailest));
    }

    return Phaser.Utils.Array.GetRandom(pool);
  }

  async startTurn() {
    if (this.isCombatActive) return;
    this.isCombatActive = true;

    if (this.teamShield.turnsLeft > 0) {
      this.teamShield.turnsLeft -= 1;
      if (this.teamShield.turnsLeft === 0 && this.teamShield.amount > 0) {
        this.addLog('🛡️ Le bouclier de l\'équipe se dissipe.');
        this.teamShield.amount = 0;
      }
    }

    let allUnits = [...this.playerTeam, ...this.enemyTeam].filter(u => u.hp > 0).sort((a, b) => b.agi - a.agi);

    for (let attacker of allUnits) {
      if (attacker.hp <= 0) continue;

      let actAgain = true;
      while (actAgain) {
        const allies = (attacker.side === 'player' ? this.playerTeam : this.enemyTeam).filter(u => u.hp > 0);
        const targets = (attacker.side === 'player' ? this.enemyTeam : this.playerTeam).filter(u => u.hp > 0);
        if (targets.length === 0 || attacker.hp <= 0) break;

        const triggerSkill = attacker.skill && Math.random() < attacker.skill.chance;
        if (triggerSkill) {
          await this.executeSkill(attacker, allies, targets);
        } else {
          await this.executeAttack(attacker, this.pickPriorityTarget(targets, attacker));
        }

        // --- Set Violent : 22% de rejouer immédiatement ---
        actAgain = !!(attacker.activeSets && attacker.activeSets.includes('violent') && Math.random() < 0.22 && attacker.hp > 0);
        if (actAgain) {
          this.addLog(`⚡ ${attacker.name} agit à nouveau (Violent) !`);
        }
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

  /** Applique des dégâts à une cible, en consommant d'abord le bouclier d'équipe si elle est côté joueur. */
  applyDamage(target, rawDamage) {
    let damage = rawDamage;
    if (target.side === 'player' && this.teamShield.amount > 0) {
      const absorbed = Math.min(this.teamShield.amount, damage);
      this.teamShield.amount -= absorbed;
      damage -= absorbed;
      if (absorbed > 0) {
        this.addLog(`🛡️ Le bouclier absorbe ${absorbed} dégâts.`);
      }
    }
    target.hp = Math.max(0, target.hp - damage);
    return damage;
  }

  /** Soigne l'attaquant selon son pourcentage de vol de vie (set Vampire), s'il en a un. */
  applyLifesteal(attacker, damageDealt) {
    if (!attacker.activeSets || !attacker.activeSets.includes('vampire') || damageDealt <= 0) return;
    const healed = Math.round(damageDealt * 0.35);
    if (healed <= 0) return;
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + healed);
    this.updateUnitUI(attacker);
    this.addLog(`🩸 ${attacker.name} draine ${healed} PV.`);
  }

  executeAttack(attacker, target) {
    return new Promise((resolve) => {
      const elementMult = getElementMultiplier(attacker.element, target.element);
      let rawDamage = Math.max(15, Math.round((attacker.atk - Math.floor(target.def / 2)) * elementMult));
      const damage = this.applyDamage(target, rawDamage);

      const elementTag = elementMult > 1 ? ' 🔺 Avantage !' : elementMult < 1 ? ' 🔻 Résisté' : '';
      const msg = `${attacker.name} touche ${target.name} (-${damage} HP)${elementTag}`;
      this.logText.setText(msg).setColor('#ffcc00');
      this.addLog(`• ${msg}`);
      this.applyLifesteal(attacker, damage);

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
            const target = this.pickPriorityTarget(targets, attacker);
            const elementMult = getElementMultiplier(attacker.element, target.element);
            let rawDamage = Math.max(20, Math.round(((attacker.atk * skill.multiplier) - (target.def / 2)) * elementMult));
            const damage = this.applyDamage(target, rawDamage);
            const elementTag = elementMult > 1 ? ' 🔺 Avantage !' : elementMult < 1 ? ' 🔻 Résisté' : '';
            this.addLog(`  -> ${target.name} subit ${damage} dégâts${elementTag}`);
            this.updateUnitUI(target);
            this.applyLifesteal(attacker, damage);
          } else if (skill.type === 'damage_aoe') {
            let totalDamage = 0;
            targets.forEach(t => {
              const elementMult = getElementMultiplier(attacker.element, t.element);
              let rawDamage = Math.max(10, Math.round(((attacker.atk * skill.multiplier) - (t.def / 2)) * elementMult));
              totalDamage += this.applyDamage(t, rawDamage);
              this.updateUnitUI(t);
            });
            this.addLog(`  -> Dégâts de zone appliqués`);
            this.applyLifesteal(attacker, totalDamage);
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
    let xpGain = this.chapter.rewardXpBonus !== undefined
      ? this.chapter.rewardXpBonus
      : xpRewardForBattle(this.chapter, this.isBossCombat);
    if (this.nightmare) xpGain = Math.round(xpGain * NIGHTMARE_XP_MULTIPLIER);

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
    const accountGain = this.chapter.rewardXpBonus !== undefined
      ? Math.round(this.chapter.rewardXpBonus * 0.6)
      : accountXpRewardForBattle(this.chapter, this.isBossCombat);
    const accountLevelsGained = addAccountXP(PLAYER_DATA, accountGain);

    if (accountLevelsGained > 0) {
      this.addLog(`🎖️ COMPTE Nv. ${PLAYER_DATA.accountLevel} ! Stamina max : ${PLAYER_DATA.maxStamina}`);
    }

    return xpGain;
  }

  /** Tente de faire looter l'Écho défini par le chapitre (set + slot). */
  rollEchoDrop() {
    const dropChance = this.isBossCombat ? 0.8 : 0.08;
    if (Math.random() >= dropChance) return null;
    if (!this.chapter.echoSet || !this.chapter.echoSlot) return null;

    const echo = createEcho(this.chapter.echoSet, this.chapter.echoSlot, this.isBossCombat ? 'boss' : 'normal');
    PLAYER_DATA.echoInventory.push(echo);
    return echo;
  }

  /** Tire les objets bonus du Reliquaire (Poussière exclue : obtenue en désenchantant). Journalise chaque obtention. */
  rollBonusItems() {
    if (this.isBossCombat) {
      if (Math.random() < 0.08) { addItem('reforge_stone', 1); this.addLog('💎 Objet obtenu : Pierre de Reforge'); }
      if (Math.random() < 0.05) { addItem('lock_seal', 1); this.addLog('🔒 Objet obtenu : Sceau de Verrouillage'); }
      if (Math.random() < 0.06) { addItem('pact_ticket', 1); this.addLog('🎫 Objet obtenu : Billet de Pacte'); }
      if (Math.random() < 0.10) { addItem('xp_tome', 1); this.addLog("📘 Objet obtenu : Tome d'XP"); }
      if (Math.random() < 0.04) { addItem('stamina_elixir', 1); this.addLog('🧪 Objet obtenu : Élixir de Stamina'); }
    }

    // --- Essence de Set : liée au chapitre visité (mode Aventure uniquement) ---
    if (this.mode === 'chapter' && this.chapter.echoSet && Math.random() < 0.15) {
      addItem(getSetEssenceKey(this.chapter.echoSet), 1);
      this.addLog(`🔷 Objet obtenu : Essence ${ECHO_SETS[this.chapter.echoSet].name}`);
    }

    // --- Fragments de Héros : boss de la Tour ou du Mode Cauchemar ---
    if (this.isBossCombat && (this.mode === 'tower' || this.nightmare) && FRAGMENT_ELIGIBLE_KEYS.length > 0 && Math.random() < 0.12) {
      const heroKey = Phaser.Utils.Array.GetRandom(FRAGMENT_ELIGIBLE_KEYS);
      const qty = 1 + Math.floor(Math.random() * 3);
      addHeroFragments(heroKey, qty);
      this.addLog(`🧩 Objet obtenu : ${qty} Fragment(s) de ${UNITS_DATABASE[heroKey].name}`);
    }

    // --- Clé de Coffre : combat de zone classique de l'Aventure ---
    if (this.mode === 'chapter' && !this.isBossCombat && Math.random() < 0.12) {
      addItem('loot_chest_key', 1);
      this.addLog('🗝️ Objet obtenu : Clé de Coffre');
    }
  }

  endBattle(playerWon) {
    this.lastPlayerWon = playerWon;

    if (playerWon) {
      let reward = (this.mode !== 'chapter' || this.isBossCombat) ? this.chapter.rewardGold : 50;
      if (this.nightmare) reward = Math.round(reward * NIGHTMARE_GOLD_MULTIPLIER);
      PLAYER_DATA.gold += reward;

      const xpGain = this.grantExperience();
      const droppedEcho = this.rollEchoDrop();
      this.rollBonusItems();

      let victoryMsg = `VICTOIRE ! +${reward} Or, +${xpGain} XP.`;

      if (droppedEcho) {
        const rarityLabel = { normal: 'Normal', magique: 'Magique', rare: 'Rare', heroique: 'Héroïque', legendaire: 'Légendaire' }[droppedEcho.rarityKey];
        victoryMsg += ` ✨ Écho obtenu (${droppedEcho.star}★ ${rarityLabel}) !`;
        this.addLog(`✨ Écho obtenu : Slot ${droppedEcho.slotId} — ${droppedEcho.star}★ ${rarityLabel}`);
      }

      if (this.mode === 'chapter' && this.isBossCombat) {
        const isFinalChapter = this.chapter.id >= CHAPTERS_DATABASE.length;
        const reachedOrPastFrontier = this.chapter.id >= PLAYER_DATA.unlockedChapter;

        if (reachedOrPastFrontier && !isFinalChapter) {
          PLAYER_DATA.unlockedChapter = Math.max(PLAYER_DATA.unlockedChapter, this.chapter.id + 1);
          PLAYER_DATA.currentChapter = PLAYER_DATA.unlockedChapter;
          PLAYER_DATA.currentTileId = 0;
          victoryMsg += ' Nouveau chapitre débloqué !';
        } else if (isFinalChapter) {
          PLAYER_DATA.unlockedChapter = Math.max(PLAYER_DATA.unlockedChapter, CHAPTERS_DATABASE.length + 1);
          PLAYER_DATA.currentTileId = this.chapter.tiles.length - 1;
          victoryMsg += this.nightmare ? ' Mode Cauchemar en cours !' : ' Tous les chapitres terminés — le Mode Cauchemar est débloqué !';
        } else {
          PLAYER_DATA.currentTileId = 0;
        }
      }

      if (this.mode === 'tower' && this.chapter.floor > PLAYER_DATA.towerHighestFloor) {
        PLAYER_DATA.towerHighestFloor = this.chapter.floor;
        victoryMsg += ` Étage ${this.chapter.floor} franchi !`;
      }

      // --- Drop d'Éclat de Pacte Supérieur, sur tout combat de boss (chapitre, Donjon, Tour) ---
      if (this.isBossCombat) {
        const shardDropChance = this.nightmare ? 0.35 : 0.2;
        if (Math.random() < shardDropChance) {
          PLAYER_DATA.summonShards = (PLAYER_DATA.summonShards || 0) + 1;
          victoryMsg += ` 🌠 Éclat de Pacte Supérieur obtenu !`;
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

    this.time.delayedCall(1200 / this.gameSpeed, () => {
      this.showEndButtons();
    });
  }

  /** Affiche les options de fin de combat, adaptées au mode (Aventure, Donjon, Tour). */
  showEndButtons() {
    const transitionTo = (callback) => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, callback);
    };

    const y = 560;
    const makeBtn = (x, width, label, color, onClick) => {
      const btn = this.add.rectangle(x, y, width, 40, color).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
      this.add.text(x, y, label, { fontSize: '12px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
      btn.on('pointerover', () => btn.setAlpha(0.85));
      btn.on('pointerout', () => btn.setAlpha(1));
      btn.on('pointerdown', onClick);
      return btn;
    };

    if (this.mode === 'daily') {
      makeBtn(290, 220, '▶ Retour', 0x228844, () => transitionTo(() => {
        this.scene.start('ChapterSelectScene');
      }));
      return;
    }

    if (this.mode === 'tower') {
      // --- Repère d'étage : pour ne jamais perdre le fil de sa progression ---
      this.add.text(290, 525, `🗼 Étage ${this.chapter.floor} / ${TOWER_MAX_FLOOR}`, {
        fontSize: '12px', color: '#88aaff', fontStyle: 'bold'
      }).setOrigin(0.5);

      const canAdvance = this.lastPlayerWon && this.chapter.floor < TOWER_MAX_FLOOR && this.chapter.floor <= PLAYER_DATA.towerHighestFloor;
      if (canAdvance) {
        makeBtn(150, 260, '⬆ Étage Suivant', 0x228844, () => transitionTo(() => {
          this.scene.start('BattleScene', {
            mode: 'tower',
            isBoss: getTowerFloorData(this.chapter.floor + 1).isBossFloor,
            chapter: getTowerFloorData(this.chapter.floor + 1)
          });
        }));
        makeBtn(430, 260, '🏛 Retour à la Tour', 0x557799, () => transitionTo(() => {
          this.scene.start('TowerScene');
        }));
      } else {
        makeBtn(290, 260, '🏛 Retour à la Tour', 0x557799, () => transitionTo(() => {
          this.scene.start('TowerScene');
        }));
      }
      return;
    }

    // --- Mode 'chapter' (Aventure / Mode Cauchemar) : comportement d'origine ---
    const goContinue = () => transitionTo(() => {
      if (this.isBossCombat) {
        this.scene.start('ChapterSelectScene', { actId: this.chapter.actId });
      } else {
        this.scene.start('MapScene');
      }
    });

    const goReplay = () => transitionTo(() => {
      this.scene.restart({ isBoss: this.isBossCombat, chapter: this.chapter });
    });

    const goChapterSelect = () => transitionTo(() => {
      this.scene.start('ChapterSelectScene', { actId: this.chapter.actId });
    });

    makeBtn(95, 150, '🔁 Rejouer', 0x555577, goReplay);
    makeBtn(290, 170, '▶ Continuer', 0x228844, goContinue);
    makeBtn(485, 150, '📜 Chapitres', 0x557799, goChapterSelect);
  }
}