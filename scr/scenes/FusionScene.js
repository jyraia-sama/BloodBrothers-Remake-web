import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { UNITS_DATABASE } from '../database.js';

export class FusionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FusionScene' });
    this.selectedBaseIndex = null;
    this.selectedSacrificeIndex = null;
  }

  create() {
    this.add.text(400, 30, 'AUTEL DE FUSION ET TRANSMUTATION', { fontSize: '20px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);

    this.infoText = this.add.text(400, 70, 'Sélectionnez l\'unité principale à améliorer', { fontSize: '13px', color: '#ffffff' }).setOrigin(0.5);

    // Bouton d'action Fusion / Évolution
    this.actionBtn = this.add.rectangle(400, 240, 260, 40, 0x444444).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff);
    this.actionBtnText = this.add.text(400, 240, 'CHOISIR LES UNITÉS', { fontSize: '13px', color: '#888888', fontStyle: 'bold' }).setOrigin(0.5);

    this.actionBtn.on('pointerdown', () => this.executeFusion());

    // Emplacements visuels des deux cartes
    this.baseSlot = this.add.rectangle(280, 150, 100, 120, 0x222233).setStrokeStyle(2, 0x888888);
    this.baseText = this.add.text(280, 150, 'Principale', { fontSize: '12px', color: '#aaaaaa' }).setOrigin(0.5);

    this.add.text(400, 150, '+', { fontSize: '28px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    this.sacSlot = this.add.rectangle(520, 150, 100, 120, 0x222233).setStrokeStyle(2, 0x888888);
    this.sacText = this.add.text(520, 150, 'Sacrifice / Doublon', { fontSize: '12px', color: '#aaaaaa' }).setOrigin(0.5);

    // Bouton de retour au menu
    const backBtn = this.add.rectangle(80, 30, 100, 30, 0x444466).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(80, 30, '‹ Menu', { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.renderInventory();
  }

  renderInventory() {
    if (this.inventoryContainer) this.inventoryContainer.destroy();
    this.inventoryContainer = this.add.container(0, 300);

    this.add.text(400, 290, '--- VOTRE INVENTAIRE ---', { fontSize: '12px', color: '#888888' }).setOrigin(0.5);

    PLAYER_DATA.inventory.forEach((unitKey, index) => {
      const unit = UNITS_DATABASE[unitKey];
      const col = index % 6;
      const row = Math.floor(index / 6);
      const x = 90 + col * 124;
      const y = 50 + row * 110;

      const isBase = this.selectedBaseIndex === index;
      const isSac = this.selectedSacrificeIndex === index;

      let strokeColor = 0xffffff;
      if (isBase) strokeColor = 0x00ff00;
      if (isSac) strokeColor = 0xff0000;

      const card = this.add.rectangle(x, y, 100, 90, unit.color).setStrokeStyle(isBase || isSac ? 3 : 1, strokeColor).setInteractive({ useHandCursor: true });
      
      const nameText = this.add.text(x, y - 25, unit.name.split(' ')[0], { fontSize: '11px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
      const lvlText = this.add.text(x, y - 5, `Niv. ${unit.level}/${unit.maxLevel}`, { fontSize: '10px', color: '#ffdd00' }).setOrigin(0.5);
      const statsText = this.add.text(x, y + 15, `⚔️${unit.atk} 🛡️${unit.def}`, { fontSize: '9px', color: '#ffffff' }).setOrigin(0.5);

      this.inventoryContainer.add([card, nameText, lvlText, statsText]);

      card.on('pointerdown', () => this.handleCardClick(index));
    });

    this.updateActionUI();
  }

  handleCardClick(index) {
    if (this.selectedBaseIndex === null) {
      this.selectedBaseIndex = index;
    } else if (this.selectedBaseIndex === index) {
      this.selectedBaseIndex = null;
      this.selectedSacrificeIndex = null;
    } else if (this.selectedSacrificeIndex === index) {
      this.selectedSacrificeIndex = null;
    } else {
      this.selectedSacrificeIndex = index;
    }
    this.renderInventory();
  }

  updateActionUI() {
    if (this.selectedBaseIndex === null) {
      this.baseText.setText('Principale');
      this.sacText.setText('Sacrifice');
      this.infoText.setText('Sélectionnez la carte principale à renforcer').setColor('#ffffff');
      this.actionBtn.setFillStyle(0x444444);
      this.actionBtnText.setText('SÉLECTIONNER');
      return;
    }

    const baseKey = PLAYER_DATA.inventory[this.selectedBaseIndex];
    const baseUnit = UNITS_DATABASE[baseKey];
    this.baseText.setText(`${baseUnit.name}\nNiv. ${baseUnit.level}/${baseUnit.maxLevel}`);

    if (this.selectedSacrificeIndex === null) {
      this.sacText.setText('Sacrifice');
      this.infoText.setText('Sélectionnez une carte à sacrifier ou un doublon identique').setColor('#ffffff');
      this.actionBtn.setFillStyle(0x444444);
      this.actionBtnText.setText('SÉLECTIONNER SACRIFICE');
      return;
    }

    const sacKey = PLAYER_DATA.inventory[this.selectedSacrificeIndex];
    const sacUnit = UNITS_DATABASE[sacKey];
    this.sacText.setText(`${sacUnit.name}\nNiv. ${sacUnit.level}/${sacUnit.maxLevel}`);

    const isSameUnit = baseKey === sacKey;
    const isMaxLvl = baseUnit.level >= baseUnit.maxLevel;
    const canEvolve = isSameUnit && isMaxLvl && baseUnit.evolutionTarget;

    if (canEvolve) {
      const targetUnit = UNITS_DATABASE[baseUnit.evolutionTarget];
      this.infoText.setText(`ÉVOLUTION : Transmutation en ${targetUnit.name} ! (Gratuit)`).setColor('#00ff00');
      this.actionBtn.setFillStyle(0x008800);
      this.actionBtnText.setText('ÉVOLUER (TRANSMUTER)');
    } else {
      const hasEnoughGold = PLAYER_DATA.gold >= 50;

      if (isMaxLvl) {
        this.infoText.setText(`Niveau maximum atteint (${baseUnit.maxLevel}). Évolution requise !`).setColor('#ff4444');
        this.actionBtn.setFillStyle(0x444444);
        this.actionBtnText.setText('NIVEAU MAX ATTEINT');
      } else if (!hasEnoughGold) {
        this.infoText.setText(`Or insuffisant ! Il vous faut 50 pièces d'or (Actuel: ${PLAYER_DATA.gold})`).setColor('#ff4444');
        this.actionBtn.setFillStyle(0x444444);
        this.actionBtnText.setText('OR INSUFFISANT (50 💰)');
      } else {
        this.infoText.setText(`FUSION : Sacrifier ${sacUnit.name} (+1 Niv, +12% ATK/DEF, +10% HP) - Coût: 50 Or`).setColor('#ffcc00');
        this.actionBtn.setFillStyle(0xaa6600);
        this.actionBtnText.setText('FUSIONNER (50 💰)');
      }
    }
  }

  executeFusion() {
    if (this.selectedBaseIndex === null || this.selectedSacrificeIndex === null) return;

    const baseKey = PLAYER_DATA.inventory[this.selectedBaseIndex];
    const sacKey = PLAYER_DATA.inventory[this.selectedSacrificeIndex];
    const baseUnit = UNITS_DATABASE[baseKey];

    const isSameUnit = baseKey === sacKey;
    const isMaxLvl = baseUnit.level >= baseUnit.maxLevel;
    const canEvolve = isSameUnit && isMaxLvl && baseUnit.evolutionTarget;

    if (canEvolve) {
      // Transmutation (Évolution de rang)
      PLAYER_DATA.inventory[this.selectedBaseIndex] = baseUnit.evolutionTarget;
      PLAYER_DATA.inventory.splice(this.selectedSacrificeIndex, 1);

      const deckIndex = PLAYER_DATA.deck.indexOf(baseKey);
      if (deckIndex !== -1) {
        PLAYER_DATA.deck[deckIndex] = baseUnit.evolutionTarget;
      }
    } else {
      // Vérification du niveau max et de l'or
      if (baseUnit.level >= baseUnit.maxLevel || PLAYER_DATA.gold < 50) return;

      // Déduction de l'or
      PLAYER_DATA.gold -= 50;

      // Gain de niveau et augmentation des stats (+12% ATK/DEF, +10% HP)
      baseUnit.level += 1;
      baseUnit.atk = Math.floor(baseUnit.atk * 1.12);
      baseUnit.def = Math.floor(baseUnit.def * 1.12);
      baseUnit.maxHp = Math.floor(baseUnit.maxHp * 1.10);
      baseUnit.hp = baseUnit.maxHp;

      // Suppression de l'unité sacrifiée
      PLAYER_DATA.inventory.splice(this.selectedSacrificeIndex, 1);
    }

    saveGameData();
    this.selectedBaseIndex = null;
    this.selectedSacrificeIndex = null;
    this.renderInventory();
  }
}