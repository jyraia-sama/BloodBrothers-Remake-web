// ==========================================
// SAUVEGARDE ET CHARGEMENT (LOCALSTORAGE)
// ==========================================
const SAVE_KEY = 'BLOOD_BROTHERS_SAVE_V1';

const DEFAULT_PLAYER_DATA = {
  stamina: 10,
  maxStamina: 10,
  gold: 500,
  currentTileIndex: 0,
  inventory: ['chevalier', 'archer', 'mage', 'chevalier', 'archer', 'squelette'],
  deck: ['chevalier', 'archer', 'mage', 'chevalier', 'archer']
};

function loadGameData() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Erreur lors du chargement de la sauvegarde', e);
    }
  }
  return JSON.parse(JSON.stringify(DEFAULT_PLAYER_DATA));
}

function saveGameData() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(PLAYER_DATA));
}

function resetGameData() {
  localStorage.removeItem(SAVE_KEY);
  Object.assign(PLAYER_DATA, JSON.parse(JSON.stringify(DEFAULT_PLAYER_DATA)));
}

const PLAYER_DATA = loadGameData();

// ==========================================
// BASE DE DONNÉES ET CARTE
// ==========================================
const UNITS_DATABASE = {
  chevalier: { 
    name: 'Chevalier Noir', hp: 1000, maxHp: 1000, atk: 180, def: 120, agi: 100, color: 0x880000, rarity: 'R',
    skill: { name: 'Coup Dévastateur', chance: 0.3, type: 'damage_single', multiplier: 1.8 }
  },
  archer: { 
    name: 'Elf Sylvestre', hp: 750, maxHp: 750, atk: 220, def: 80, agi: 150, color: 0x008800, rarity: 'R',
    skill: { name: 'Pluie de Flèches', chance: 0.35, type: 'damage_aoe', multiplier: 0.7 }
  },
  mage: { 
    name: 'Sorcier Sombre', hp: 600, maxHp: 600, atk: 280, def: 60, agi: 90, color: 0x440088, rarity: 'SR',
    skill: { name: 'Soin Obscur', chance: 0.3, type: 'heal_team', power: 200 }
  },
  squelette: { 
    name: 'Guerrier Squelette', hp: 800, maxHp: 800, atk: 150, def: 90, agi: 110, color: 0x888888, rarity: 'N',
    skill: { name: 'Cri d\'Effroi', chance: 0.25, type: 'buff_atk', amount: 30 }
  },
  boss: { 
    name: 'Seigneur Démon', hp: 2000, maxHp: 2000, atk: 320, def: 180, agi: 130, color: 0xaa00aa, rarity: 'SSR',
    skill: { name: 'Cataclysme', chance: 0.4, type: 'damage_aoe', multiplier: 1.2 }
  }
};

const mapTiles = [
  { id: 0, type: 'start', label: 'Départ', color: 0x333344 },
  { id: 1, type: 'gold', label: 'Trésor', color: 0xddaa00 },
  { id: 2, type: 'battle', label: 'Ennemi', color: 0xaa2222 },
  { id: 3, type: 'empty', label: 'Neutre', color: 0x444455 },
  { id: 4, type: 'gold', label: 'Trésor', color: 0xddaa00 },
  { id: 5, type: 'battle', label: 'Ennemi', color: 0xaa2222 },
  { id: 6, type: 'heal', label: 'Fontaine', color: 0x22aa22 },
  { id: 7, type: 'boss', label: 'BOSS', color: 0x8800aa }
];

// ==========================================
// SCÈNE 0 : MENU PRINCIPAL (HUB CENTRAL)
// ==========================================
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.add.text(400, 80, 'BLOOD BROTHERS', {
      fontSize: '40px', color: '#ff2222', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 125, 'REMAKE WEB', {
      fontSize: '20px', color: '#ffffff'
    }).setOrigin(0.5);

    this.add.rectangle(400, 180, 500, 40, 0x222233).setStrokeStyle(1, 0x555577);
    this.uiText = this.add.text(400, 180, '', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
    this.updateUI();

    this.createButton(400, 250, '🗺️  Aventure (Carte)', 0xaa2222, () => {
      this.scene.start('MapScene');
    });

    this.createButton(400, 320, '🛡️  Gestion du Deck', 0x3355aa, () => {
      this.scene.start('DeckScene');
    });

    this.createButton(400, 390, '🔮  Invocations (Pacte)', 0x8800aa, () => {
      this.scene.start('GachaScene');
    });

    // Bouton Réinitialiser la Sauvegarde
    this.createButton(400, 480, '⚠️  Effacer la partie', 0x552222, () => {
      resetGameData();
      this.updateUI();
    });
  }

  updateUI() {
    this.uiText.setText(`⚡ Stamina: ${PLAYER_DATA.stamina}/${PLAYER_DATA.maxStamina}   |   💰 Or: ${PLAYER_DATA.gold}`);
  }

  createButton(x, y, label, color, callback) {
    const btnBg = this.add.rectangle(x, y, 280, 45, color)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xffffff);

    this.add.text(x, y, label, {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    btnBg.on('pointerdown', callback);
    btnBg.on('pointerover', () => btnBg.setAlpha(0.8));
    btnBg.on('pointerout', () => btnBg.setAlpha(1.0));
  }
}

// ==========================================
// SCÈNE : GESTION DU DECK
// ==========================================
class DeckScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DeckScene' });
  }

  create() {
    this.add.text(400, 40, 'GESTION DU DECK', {
      fontSize: '26px', color: '#3355aa', fontStyle: 'bold'
    }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.infoText = this.add.text(400, 80, 'Cliquez sur une carte de l\'inventaire pour l\'ajouter au deck (Max 5)', {
      fontSize: '14px', color: '#aaaaaa'
    }).setOrigin(0.5);

    this.renderDeck();
    this.renderInventory();
  }

  renderDeck() {
    if (this.deckContainer) this.deckContainer.destroy();
    this.deckContainer = this.add.container(0, 0);

    const title = this.add.text(400, 120, `ÉQUIPE ÉQUIPÉE (${PLAYER_DATA.deck.length}/5)`, {
      fontSize: '16px', color: '#00ff00', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.deckContainer.add(title);

    const startX = 150, spacing = 125, y = 180;

    PLAYER_DATA.deck.forEach((unitKey, index) => {
      const unit = UNITS_DATABASE[unitKey];
      const x = startX + index * spacing;

      const card = this.add.rectangle(x, y, 90, 100, unit.color)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });

      const nameText = this.add.text(x, y - 25, unit.name.split(' ')[0], { fontSize: '11px', color: '#fff' }).setOrigin(0.5);
      const atkText = this.add.text(x, y + 25, `ATK:${unit.atk}`, { fontSize: '11px', color: '#ffdd00' }).setOrigin(0.5);

      card.on('pointerdown', () => {
        PLAYER_DATA.deck.splice(index, 1);
        saveGameData();
        this.renderDeck();
      });

      this.deckContainer.add([card, nameText, atkText]);
    });
  }

  renderInventory() {
    if (this.inventoryContainer) this.inventoryContainer.destroy();
    this.inventoryContainer = this.add.container(0, 0);

    const title = this.add.text(400, 270, 'RESERVE / INVENTAIRE', {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.inventoryContainer.add(title);

    const startX = 100, spacing = 100, rowY = 340;

    PLAYER_DATA.inventory.forEach((unitKey, index) => {
      const unit = UNITS_DATABASE[unitKey];
      const x = startX + (index % 7) * spacing;
      const y = rowY + Math.floor(index / 7) * 110;

      const card = this.add.rectangle(x, y, 80, 90, unit.color)
        .setStrokeStyle(1, 0xaaaaaa)
        .setInteractive({ useHandCursor: true });

      const nameText = this.add.text(x, y - 20, unit.name.split(' ')[0], { fontSize: '10px', color: '#fff' }).setOrigin(0.5);
      const rarityText = this.add.text(x, y + 20, `[${unit.rarity}]`, { fontSize: '12px', color: '#ffdd00' }).setOrigin(0.5);

      card.on('pointerdown', () => {
        if (PLAYER_DATA.deck.length < 5) {
          PLAYER_DATA.deck.push(unitKey);
          saveGameData();
          this.renderDeck();
        } else {
          this.infoText.setText('Deck plein ! Retirez une carte d\'abord.').setColor('#ff4444');
        }
      });

      this.inventoryContainer.add([card, nameText, rarityText]);
    });
  }
}

// ==========================================
// SCÈNE : INVOCATIONS / GACHA
// ==========================================
class GachaScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GachaScene' });
  }

  create() {
    this.add.text(400, 50, 'AUTEL D\'INVOCATION', {
      fontSize: '28px', color: '#aa00aa', fontStyle: 'bold'
    }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.goldText = this.add.text(400, 100, `💰 Or disponible : ${PLAYER_DATA.gold}`, {
      fontSize: '18px', color: '#ffdd00'
    }).setOrigin(0.5);

    this.cardDisplay = this.add.rectangle(400, 270, 160, 220, 0x222233).setStrokeStyle(2, 0x555577);
    this.cardText = this.add.text(400, 250, 'Faites un pacte !', { fontSize: '16px', color: '#888888' }).setOrigin(0.5);
    this.rarityText = this.add.text(400, 290, '', { fontSize: '20px', fontStyle: 'bold' }).setOrigin(0.5);

    const summonBtn = this.add.rectangle(400, 440, 220, 50, 0x8800aa)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xffffff);
    this.add.text(400, 440, 'Pacte x1 (100 Or)', { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    this.logText = this.add.text(400, 510, '', { fontSize: '14px', color: '#ff4444' }).setOrigin(0.5);

    summonBtn.on('pointerdown', () => this.drawSummon());
  }

  drawSummon() {
    if (PLAYER_DATA.gold < 100) {
      this.logText.setText('Pas assez d\'or !');
      return;
    }

    PLAYER_DATA.gold -= 100;
    const keys = Object.keys(UNITS_DATABASE);
    const drawnKey = Phaser.Utils.Array.GetRandom(keys);
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

// ==========================================
// SCÈNE 1 : LE PLATEAU DE JEU (MAP)
// ==========================================
class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' });
  }

  preload() {
    this.load.image('icon_gold', 'assets/chest.png');
    this.load.image('icon_battle', 'assets/crossed_swords.png');
    this.load.image('icon_heal', 'assets/potion.png');
    this.load.image('icon_boss', 'assets/boss.png');
    this.load.image('player_avatar', 'assets/knight_avatar.png');
    this.load.image('tile_bg', 'assets/map_tile.png');
  }

  create() {
    this.add.text(400, 30, 'CHAPITRE 1 : LA FORÊT SOMBRE', {
      fontSize: '22px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    const startX = 100, startY = 300, spacingX = 85;
    const pathGraphics = this.add.graphics();
    pathGraphics.lineStyle(6, 0x555566, 1);
    pathGraphics.beginPath();
    pathGraphics.moveTo(startX, startY);
    pathGraphics.lineTo(startX + (mapTiles.length - 1) * spacingX, startY);
    pathGraphics.strokePath();

    mapTiles.forEach((tile, index) => {
      const x = startX + index * spacingX;
      const y = startY;

      if (this.textures.exists('tile_bg')) {
        this.add.image(x, y, 'tile_bg').setDisplaySize(64, 64);
      } else {
        this.add.circle(x, y, 32, tile.color).setStrokeStyle(3, 0xffffff);
      }

      let iconKey = null;
      if (tile.type === 'gold') iconKey = 'icon_gold';
      else if (tile.type === 'battle') iconKey = 'icon_battle';
      else if (tile.type === 'heal') iconKey = 'icon_heal';
      else if (tile.type === 'boss') iconKey = 'icon_boss';

      if (iconKey && this.textures.exists(iconKey)) {
        this.add.image(x, y, iconKey).setDisplaySize(32, 32);
      }

      this.add.text(x, y + 45, tile.label, { fontSize: '12px', color: '#cccccc' }).setOrigin(0.5);

      tile.x = x;
      tile.y = y;
    });

    const currentTile = mapTiles[PLAYER_DATA.currentTileIndex];
    if (this.textures.exists('player_avatar')) {
      this.playerGraphic = this.add.image(currentTile.x, currentTile.y - 10, 'player_avatar').setDisplaySize(48, 48);
    } else {
      this.playerGraphic = this.add.circle(currentTile.x, currentTile.y, 20, 0x00aaff).setStrokeStyle(3, 0xffffff);
    }

    this.add.rectangle(400, 90, 760, 40, 0x222233).setStrokeStyle(1, 0x555577);
    this.uiText = this.add.text(30, 82, '', { fontSize: '16px', color: '#ffffff' });
    this.updateUI();

    this.logText = this.add.text(400, 480, 'Cliquez sur "Avancer" pour explorer.', { fontSize: '16px', color: '#ffcc00' }).setOrigin(0.5);

    const btnBg = this.add.rectangle(400, 540, 200, 45, 0x338833).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff);
    this.add.text(400, 540, 'AVANCER (-1 Stamina)', { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    btnBg.on('pointerdown', () => this.movePlayer());
  }

  updateUI() {
    this.uiText.setText(`⚡ Stamina: ${PLAYER_DATA.stamina}/${PLAYER_DATA.maxStamina}   |   💰 Or: ${PLAYER_DATA.gold}   |   📍 Case: ${PLAYER_DATA.currentTileIndex + 1}/${mapTiles.length}`);
  }

  movePlayer() {
    if (PLAYER_DATA.stamina <= 0) {
      this.logText.setText('Plus assez de Stamina !').setColor('#ff4444');
      return;
    }
    if (PLAYER_DATA.currentTileIndex >= mapTiles.length - 1) {
      this.logText.setText('Niveau terminé !').setColor('#00ff00');
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
      const gainedGold = Math.floor(Math.random() * 50) + 20;
      PLAYER_DATA.gold += gainedGold;
      saveGameData();
      this.logText.setText(`Trésor trouvé ! +${gainedGold} Or.`).setColor('#ffdd00');
      this.updateUI();
    } else if (tile.type === 'heal') {
      PLAYER_DATA.stamina = Math.min(PLAYER_DATA.maxStamina, PLAYER_DATA.stamina + 3);
      saveGameData();
      this.logText.setText('Fontaine ! +3 Stamina.').setColor('#44ff44');
      this.updateUI();
    } else if (tile.type === 'battle' || tile.type === 'boss') {
      this.logText.setText('Combat détecté ! Lancement...').setColor('#ff4444');
      this.time.delayedCall(800, () => {
        this.scene.start('BattleScene', { isBoss: tile.type === 'boss' });
      });
    } else {
      this.logText.setText('Voie libre.').setColor('#ffffff');
    }
  }
}

// ==========================================
// SCÈNE 2 : LE COMBAT (BATTLE)
// ==========================================
class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data) {
    this.isBossCombat = data ? data.isBoss : false;
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x111122);
    const title = this.isBossCombat ? 'COMBAT CONTRE LE BOSS' : 'COMBAT DE ZONE';
    this.add.text(400, 30, title, { fontSize: '24px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5);

    this.playerTeam = PLAYER_DATA.deck.map(unitKey => ({
      ...UNITS_DATABASE[unitKey],
      side: 'player'
    }));

    if (this.isBossCombat) {
      this.enemyTeam = [
        { ...UNITS_DATABASE.squelette, side: 'enemy' },
        { ...UNITS_DATABASE.boss, side: 'enemy' },
        { ...UNITS_DATABASE.squelette, side: 'enemy' }
      ];
    } else {
      this.enemyTeam = [
        { ...UNITS_DATABASE.squelette, side: 'enemy' },
        { ...UNITS_DATABASE.squelette, side: 'enemy' },
        { ...UNITS_DATABASE.squelette, side: 'enemy' }
      ];
    }

    this.renderTeam(this.playerTeam, 150, 450);
    this.renderTeam(this.enemyTeam, 200, 150);

    this.logText = this.add.text(400, 300, 'Préparation...', { fontSize: '18px', color: '#ffcc00' }).setOrigin(0.5);

    this.isCombatActive = false;
    this.time.delayedCall(1000, () => this.startTurn());
  }

  renderTeam(team, startX, startY) {
    const spacing = 125;
    team.forEach((unit, index) => {
      const x = startX + index * spacing;
      const y = startY;

      const card = this.add.rectangle(x, y, 90, 110, unit.color).setStrokeStyle(2, 0xffffff);
      unit.cardGraphics = card;

      this.add.text(x, y - 35, unit.name.split(' ')[0], { fontSize: '12px', color: '#fff' }).setOrigin(0.5);
      unit.hpText = this.add.text(x, y + 35, `${unit.hp}/${unit.maxHp}`, { fontSize: '12px', color: '#00ff00' }).setOrigin(0.5);
    });
  }

  async startTurn() {
    if (this.isCombatActive) return;
    this.isCombatActive = true;

    let allUnits = [...this.playerTeam, ...this.enemyTeam]
      .filter(u => u.hp > 0)
      .sort((a, b) => b.agi - a.agi);

    for (let attacker of allUnits) {
      if (attacker.hp <= 0) continue;

      const allies = (attacker.side === 'player' ? this.playerTeam : this.enemyTeam).filter(u => u.hp > 0);
      const targets = (attacker.side === 'player' ? this.enemyTeam : this.playerTeam).filter(u => u.hp > 0);
      if (targets.length === 0) break;

      const triggerSkill = attacker.skill && Math.random() < attacker.skill.chance;

      if (triggerSkill) {
        await this.executeSkill(attacker, allies, targets);
      } else {
        const target = Phaser.Utils.Array.GetRandom(targets);
        await this.executeAttack(attacker, target);
      }
    }

    const playerAlive = this.playerTeam.some(u => u.hp > 0);
    const enemyAlive = this.enemyTeam.some(u => u.hp > 0);

    if (enemyAlive && playerAlive) {
      this.isCombatActive = false;
      this.time.delayedCall(500, () => this.startTurn());
    } else {
      this.endBattle(playerAlive);
    }
  }

  executeAttack(attacker, target) {
    return new Promise((resolve) => {
      let damage = Math.max(15, attacker.atk - Math.floor(target.def / 2));
      target.hp = Math.max(0, target.hp - damage);

      this.logText.setText(`${attacker.name} inflige ${damage} degats !`).setColor('#ffcc00');

      this.tweens.add({
        targets: attacker.cardGraphics,
        y: attacker.cardGraphics.y + (attacker.side === 'player' ? -20 : 20),
        duration: 120,
        yoyo: true,
        onComplete: () => {
          this.updateUnitUI(target);
          this.time.delayedCall(300, resolve);
        }
      });
    });
  }

  executeSkill(attacker, allies, targets) {
    return new Promise((resolve) => {
      const skill = attacker.skill;
      this.logText.setText(`✨ ${attacker.name} lance : ${skill.name} !`).setColor('#00ffff');

      this.tweens.add({
        targets: attacker.cardGraphics,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 150,
        yoyo: true,
        onComplete: () => {
          if (skill.type === 'damage_single') {
            const target = Phaser.Utils.Array.GetRandom(targets);
            let damage = Math.max(20, Math.floor((attacker.atk * skill.multiplier) - (target.def / 2)));
            target.hp = Math.max(0, target.hp - damage);
            this.updateUnitUI(target);

          } else if (skill.type === 'damage_aoe') {
            targets.forEach(t => {
              let damage = Math.max(10, Math.floor((attacker.atk * skill.multiplier) - (t.def / 2)));
              t.hp = Math.max(0, t.hp - damage);
              this.updateUnitUI(t);
            });

          } else if (skill.type === 'heal_team') {
            allies.forEach(a => {
              a.hp = Math.min(a.maxHp, a.hp + skill.power);
              this.updateUnitUI(a);
            });

          } else if (skill.type === 'buff_atk') {
            allies.forEach(a => {
              a.atk += skill.amount;
            });
          }

          this.time.delayedCall(500, resolve);
        }
      });
    });
  }

  updateUnitUI(unit) {
    unit.hpText.setText(`${unit.hp}/${unit.maxHp}`);
    if (unit.hp <= 0) {
      unit.cardGraphics.setAlpha(0.3);
      unit.hpText.setText('K.O.').setColor('#ff0000');
    }
  }

  endBattle(playerWon) {
    if (playerWon) {
      const rewardGold = this.isBossCombat ? 200 : 50;
      PLAYER_DATA.gold += rewardGold;
      saveGameData();
      this.logText.setText(`VICTOIRE ! +${rewardGold} Or gagnés.`).setColor('#00ff00');
    } else {
      this.logText.setText('DÉFAITE...').setColor('#ff0000');
    }

    this.time.delayedCall(2500, () => {
      this.scene.start('MapScene');
    });
  }
}

// ==========================================
// CONFIGURATION GLOBALE
// ==========================================
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#111116',
  scene: [MenuScene, DeckScene, GachaScene, MapScene, BattleScene]
};

const game = new Phaser.Game(config);