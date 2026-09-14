import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { UNITS_DATABASE } from '../database.js';

export class FusionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FusionScene' });
    this.selectedPrimary = null;
    this.selectedSacrifice = null;
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x111622);
    this.add.text(400, 35, 'AUTEL DE FUSION', { fontSize: '26px', color: '#ff8800', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.goldText = this.add.text(700, 30, `💰 ${PLAYER_DATA.gold}`, { fontSize: '16px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);

    this.add.text(200, 85, 'Unité Principale (Conservée)', { fontSize: '13px', color: '#00ff00', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(600, 85, 'Unité à Sacrifier (Perdue)', { fontSize: '13px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5);

    // Emplacements pour la fusion
    this.primarySlot = this.add.rectangle(200, 160, 120, 130, 0x222233).setStrokeStyle(2, 0x00ff00).setInteractive({ useHandCursor: true });
    this.primaryText = this.add.text(200, 160, 'Choisir\n(Cliquer pour\ndésélectionner)', { fontSize: '11px', color: '#888888', align: 'center' }).setOrigin(0.5);

    this.sacrificeSlot = this.add.rectangle(600, 160, 120, 130, 0x222233).setStrokeStyle(2, 0xff4444).setInteractive({ useHandCursor: true });
    this.sacrificeText = this.add.text(600, 160, 'Choisir\n(Cliquer pour\ndésélectionner)', { fontSize: '11px', color: '#888888', align: 'center' }).setOrigin(0.5);

    // Texte d'information sur le bonus et le coût
    const infoBonusStr = '✨ Effet : L\'unité principale gagne +15% de PV et d\'Attaque\n🪙 Coût : 50 pièces d\'or';
    this.add.text(400, 245, infoBonusStr, { fontSize: '13px', color: '#00ffff', align: 'center', lineSpacing: 4 }).setOrigin(0.5);

    // Bouton de validation de la fusion
    this.fuseBtn = this.add.rectangle(400, 305, 200, 45, 0x555555).setStrokeStyle(2, 0x888888);
    this.fuseBtnText = this.add.text(400, 305, 'FUSIONNER (50 Or)', { fontSize: '15px', color: '#aaaaaa', fontStyle: 'bold' }).setOrigin(0.5);

    this.logText = this.add.text(400, 355, 'Sélectionnez deux unités de même rareté.', { fontSize: '13px', color: '#ffcc00' }).setOrigin(0.5);

    this.add.text(400, 385, 'INVENTAIRE DISPONIBLE', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    // Gestion du clic pour désélectionner directement via les emplacements du haut
    this.primarySlot.on('pointerdown', () => {
      if (this.selectedPrimary) {
        this.selectedPrimary = null;
        this.primaryText.setText('Choisir\n(Cliquer pour\ndésélectionner)').setColor('#888888');
        this.primarySlot.setFillStyle(0x222233);
        this.lockFuseButton();
        this.logText.setText('Unité principale retirée.').setColor('#ffcc00');
        this.renderInventoryPicker();
      }
    });

    this.sacrificeSlot.on('pointerdown', () => {
      if (this.selectedSacrifice) {
        this.selectedSacrifice = null;
        this.sacrificeText.setText('Choisir\n(Cliquer pour\ndésélectionner)').setColor('#888888');
        this.sacrificeSlot.setFillStyle(0x222233);
        this.lockFuseButton();
        this.logText.setText('Unité à sacrifier retirée.').setColor('#ffcc00');
        this.renderInventoryPicker();
      }
    });

    this.renderInventoryPicker();
  }

  renderInventoryPicker() {
    if (this.inventoryContainer) this.inventoryContainer.destroy();
    this.inventoryContainer = this.add.container(0, 0);

    PLAYER_DATA.inventory.forEach((unitKey, index) => {
      // Masquer les cartes déjà sélectionnées dans l'inventaire pour éviter les doublons d'interaction
      const isSelected = (this.selectedPrimary && this.selectedPrimary.index === index) || 
                         (this.selectedSacrifice && this.selectedSacrifice.index === index);
      if (isSelected) return;

      const unit = UNITS_DATABASE[unitKey];
      const x = 80 + (index % 8) * 95;
      const y = 445 + Math.floor(index / 8) * 85;

      const card = this.add.rectangle(x, y, 80, 75, unit.color).setStrokeStyle(1, 0xaaaaaa).setInteractive({ useHandCursor: true });
      const nameText = this.add.text(x, y - 18, unit.name.split(' ')[0], { fontSize: '10px', color: '#fff' }).setOrigin(0.5);
      const rarityText = this.add.text(x, y + 18, `[${unit.rarity}]`, { fontSize: '10px', color: '#ffdd00' }).setOrigin(0.5);

      card.on('pointerdown', () => {
        this.selectUnitForFusion(unitKey, index);
      });

      this.inventoryContainer.add([card, nameText, rarityText]);
    });
  }

  selectUnitForFusion(unitKey, invIndex) {
    const unit = UNITS_DATABASE[unitKey];

    if (!this.selectedPrimary) {
      this.selectedPrimary = { key: unitKey, data: unit, index: invIndex };
      this.primaryText.setText(`${unit.name}\n(+15% Stats)`).setColor('#ffffff');
      this.primarySlot.setFillStyle(unit.color);
      this.logText.setText('Sélectionnez l\'unité à sacrifier.');
      this.renderInventoryPicker();
    } else if (!this.selectedSacrifice && invIndex !== this.selectedPrimary.index) {
      if (unit.rarity !== this.selectedPrimary.data.rarity) {
        this.logText.setText('Erreur : Les unités doivent être de la même rareté !').setColor('#ff4444');
        return;
      }
      this.selectedSacrifice = { key: unitKey, data: unit, index: invIndex };
      this.sacrificeText.setText(`${unit.name}`).setColor('#ffffff');
      this.sacrificeSlot.setFillStyle(unit.color);
      
      // Activer le bouton de fusion
      this.fuseBtn.setFillStyle(0xff8800).setInteractive({ useHandCursor: true });
      this.fuseBtnText.setText('FUSIONNER (50 Or)').setColor('#ffffff');
      this.logText.setText('Prêt pour la fusion !').setColor('#00ff00');

      // Supprimer l'écouteur précédent pour éviter les doublons d'appels, puis ajouter le nouveau
      this.fuseBtn.removeAllListeners('pointerdown');
      this.fuseBtn.on('pointerdown', () => this.executeFusion());

      this.renderInventoryPicker();
    }
  }

  lockFuseButton() {
    this.fuseBtn.setFillStyle(0x555555).disableInteractive();
    this.fuseBtnText.setText('FUSIONNER (50 Or)').setColor('#aaaaaa');
  }

  executeFusion() {
    if (!this.selectedPrimary || !this.selectedSacrifice) return;

    if (PLAYER_DATA.gold < 50) {
      this.logText.setText('Erreur : Pas assez d\'or (50 requis) !').setColor('#ff4444');
      return;
    }

    PLAYER_DATA.gold -= 50;

    // Amélioration de l'unité principale (+15% d'attaque et PV max)
    const primaryUnit = this.selectedPrimary.data;
    primaryUnit.atk = Math.floor(primaryUnit.atk * 1.15);
    primaryUnit.maxHp = Math.floor(primaryUnit.maxHp * 1.15);
    primaryUnit.hp = primaryUnit.maxHp;

    // Suppression sécurisée des index de l'inventaire par ordre décroissant
    const indicesToRemove = [this.selectedPrimary.index, this.selectedSacrifice.index].sort((a, b) => b - a);
    indicesToRemove.forEach(idx => {
      PLAYER_DATA.inventory.splice(idx, 1);
    });

    // Ré-injection de l'unité principale améliorée
    PLAYER_DATA.inventory.push(this.selectedPrimary.key);

    saveGameData();

    this.logText.setText('✨ FUSION RÉUSSIE ! Stats augmentées (-50 Or).').setColor('#00ff00');

    this.time.delayedCall(1500, () => {
      this.scene.restart();
    });
  }
}