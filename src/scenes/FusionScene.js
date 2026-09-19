import { PLAYER_DATA, saveGameData, unequipEchoesForUnit } from '../saveSystem.js';
import { UNITS_DATABASE } from '../database.js';
import { getInstanceStats } from '../levelSystem.js';
import { makeScrollable } from '../scrollHelper.js';
import { ELEMENT_ICONS } from '../elements.js';

const PICKER_VIEWPORT = { x: 400, y: 500, width: 780, height: 195 };
const PICKER_COLS = 8;
const PICKER_ROW_HEIGHT = 85;

export class FusionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FusionScene' });
    this.selectedPrimary = null;
    this.selectedSacrifice = null;
  }

  create() {
    this.selectedPrimary = null;
    this.selectedSacrifice = null;
    this.pickerScroll = null;

    this.add.rectangle(400, 300, 800, 600, 0x111622);
    this.add.text(400, 35, 'AUTEL DE FUSION', { fontSize: '26px', color: '#ff8800', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff).setDepth(50);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5).setDepth(51);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.goldText = this.add.text(700, 30, `💰 ${PLAYER_DATA.gold}`, { fontSize: '16px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);

    this.add.text(200, 85, 'Unité Principale (Conservée)', { fontSize: '13px', color: '#00ff00', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(600, 85, 'Unité à Sacrifier (Perdue)', { fontSize: '13px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5);

    this.primarySlot = this.add.rectangle(200, 160, 120, 130, 0x222233).setStrokeStyle(2, 0x00ff00).setInteractive({ useHandCursor: true }).setDepth(50);
    this.primaryText = this.add.text(200, 160, 'Choisir\n(Cliquer pour\ndésélectionner)', { fontSize: '11px', color: '#888888', align: 'center' }).setOrigin(0.5).setDepth(51);

    this.sacrificeSlot = this.add.rectangle(600, 160, 120, 130, 0x222233).setStrokeStyle(2, 0xff4444).setInteractive({ useHandCursor: true }).setDepth(50);
    this.sacrificeText = this.add.text(600, 160, 'Choisir\n(Cliquer pour\ndésélectionner)', { fontSize: '11px', color: '#888888', align: 'center' }).setOrigin(0.5).setDepth(51);

    const infoBonusStr = '✨ Effet : L\'unité principale gagne +15% de PV et d\'Attaque (cumulable)\n🪙 Coût : 50 or  |  Les héros de l\'équipe peuvent être conservés, jamais sacrifiés';
    this.add.text(400, 245, infoBonusStr, { fontSize: '12px', color: '#00ffff', align: 'center', lineSpacing: 4 }).setOrigin(0.5);

    this.fuseBtn = this.add.rectangle(400, 305, 200, 45, 0x555555).setStrokeStyle(2, 0x888888);
    this.fuseBtnText = this.add.text(400, 305, 'FUSIONNER (50 Or)', { fontSize: '15px', color: '#aaaaaa', fontStyle: 'bold' }).setOrigin(0.5).setDepth(51);

    this.logText = this.add.text(400, 355, 'Sélectionnez deux unités de même rareté.', { fontSize: '13px', color: '#ffcc00' }).setOrigin(0.5);

    this.add.text(400, 385, 'INVENTAIRE DISPONIBLE', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

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

  /**
   * Unités candidates pour l'emplacement en cours de sélection :
   * - Principale : toute unité possédée, y compris celles de l'équipe (deck).
   * - Sacrifice : uniquement les unités NON équipées (jamais un héros du deck).
   */
  getCandidates() {
    if (!this.selectedPrimary) {
      return PLAYER_DATA.inventory;
    }
    return PLAYER_DATA.inventory.filter(inst => !PLAYER_DATA.deck.includes(inst.instanceId));
  }

  renderInventoryPicker() {
    if (this.pickerScroll) {
      this.pickerScroll.destroy();
      this.pickerScroll = null;
    }
    if (this.inventoryContainer) this.inventoryContainer.destroy();
    this.inventoryContainer = this.add.container(0, 0);

    const candidates = this.getCandidates().filter(inst => {
      const isSelected =
        (this.selectedPrimary && this.selectedPrimary.instanceId === inst.instanceId) ||
        (this.selectedSacrifice && this.selectedSacrifice.instanceId === inst.instanceId);
      return !isSelected;
    });

    const viewportTop = PICKER_VIEWPORT.y - PICKER_VIEWPORT.height / 2;
    const firstRowY = viewportTop + 45;

    candidates.forEach((instance, displayIndex) => {
      const base = UNITS_DATABASE[instance.unitKey];
      if (!base) return;

      const isEquipped = PLAYER_DATA.deck.includes(instance.instanceId);
      const x = 80 + (displayIndex % PICKER_COLS) * 95;
      const y = firstRowY + Math.floor(displayIndex / PICKER_COLS) * PICKER_ROW_HEIGHT;

      const card = this.add.rectangle(x, y, 80, 75, base.color)
        .setStrokeStyle(1, isEquipped ? 0x00ff88 : 0xaaaaaa)
        .setInteractive({ useHandCursor: true });
      const nameText = this.add.text(x, y - 22, base.name.split(' ')[0], { fontSize: '10px', color: '#fff' }).setOrigin(0.5);
      const lvlText = this.add.text(x, y - 4, `Nv. ${instance.level}`, { fontSize: '10px', color: '#00ffaa' }).setOrigin(0.5);
      const tagText = this.add.text(x, y + 20, isEquipped ? '★ Équipe' : `[${base.rarity}]`, {
        fontSize: '10px', color: isEquipped ? '#00ff88' : '#ffdd00'
      }).setOrigin(0.5);
      const elementText = this.add.text(x - 30, y - 28, ELEMENT_ICONS[base.element] || '', { fontSize: '11px' }).setOrigin(0.5);

      card.on('pointerdown', () => this.selectUnitForFusion(instance));

      this.inventoryContainer.add([card, nameText, lvlText, tagText, elementText]);
    });

    if (candidates.length === 0) {
      const msg = !this.selectedPrimary
        ? 'Aucune unité disponible.'
        : 'Aucune unité en réserve disponible pour le sacrifice.';
      this.inventoryContainer.add(
        this.add.text(400, PICKER_VIEWPORT.y, msg, { fontSize: '13px', color: '#888888' }).setOrigin(0.5)
      );
    }

    // --- Défilement si la grille dépasse la zone visible ---
    const rows = Math.max(1, Math.ceil(candidates.length / PICKER_COLS));
    const contentHeight = rows * PICKER_ROW_HEIGHT + 20;
    this.pickerScroll = makeScrollable(this, this.inventoryContainer, PICKER_VIEWPORT, contentHeight);
  }

  selectUnitForFusion(instance) {
    const base = UNITS_DATABASE[instance.unitKey];
    const isEquipped = PLAYER_DATA.deck.includes(instance.instanceId);

    if (!this.selectedPrimary) {
      this.selectedPrimary = instance;
      const tag = isEquipped ? ' (Équipe)' : '';
      this.primaryText.setText(`${ELEMENT_ICONS[base.element] || ''} ${base.name}${tag}\n[${base.rarity}]  •  Nv. ${instance.level}\n(+15% Stats)`).setColor('#ffffff');
      this.primarySlot.setFillStyle(base.color);
      this.logText.setText('Sélectionnez l\'unité à sacrifier (hors équipe).').setColor('#ffcc00');
      this.renderInventoryPicker();
    } else if (!this.selectedSacrifice && instance.instanceId !== this.selectedPrimary.instanceId) {
      if (isEquipped) {
        this.logText.setText('Erreur : une unité équipée ne peut pas être sacrifiée !').setColor('#ff4444');
        return;
      }

      const primaryBase = UNITS_DATABASE[this.selectedPrimary.unitKey];
      if (base.rarity !== primaryBase.rarity) {
        this.logText.setText('Erreur : Les unités doivent être de la même rareté !').setColor('#ff4444');
        return;
      }

      this.selectedSacrifice = instance;
      this.sacrificeText.setText(`${ELEMENT_ICONS[base.element] || ''} ${base.name}\nNv. ${instance.level}`).setColor('#ffffff');
      this.sacrificeSlot.setFillStyle(base.color);

      this.fuseBtn.setFillStyle(0xff8800).setInteractive({ useHandCursor: true }).setDepth(50);
      this.fuseBtnText.setText('FUSIONNER (50 Or)').setColor('#ffffff');
      this.logText.setText('Prêt pour la fusion !').setColor('#00ff00');

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

    // Sécurité ultime : jamais sacrifier une unité équipée, même si l'état a changé entre-temps
    if (PLAYER_DATA.deck.includes(this.selectedSacrifice.instanceId)) {
      this.logText.setText('Erreur : cette unité est équipée, fusion annulée.').setColor('#ff4444');
      this.selectedSacrifice = null;
      this.sacrificeText.setText('Choisir\n(Cliquer pour\ndésélectionner)').setColor('#888888');
      this.sacrificeSlot.setFillStyle(0x222233);
      this.lockFuseButton();
      this.renderInventoryPicker();
      return;
    }

    PLAYER_DATA.gold -= 50;

    const primary = PLAYER_DATA.inventory.find(i => i.instanceId === this.selectedPrimary.instanceId);
    if (primary) {
      primary.fusionCount = (primary.fusionCount || 0) + 1;
    }

    const sacIndex = PLAYER_DATA.inventory.findIndex(i => i.instanceId === this.selectedSacrifice.instanceId);
    if (sacIndex !== -1) {
      unequipEchoesForUnit(this.selectedSacrifice.instanceId);
      PLAYER_DATA.inventory.splice(sacIndex, 1);
    }
    PLAYER_DATA.deck = PLAYER_DATA.deck.filter(id => id !== this.selectedSacrifice.instanceId);

    saveGameData();

    const newStats = primary ? getInstanceStats(UNITS_DATABASE[primary.unitKey], primary) : null;
    const statsStr = newStats ? ` (ATK ${newStats.atk} / PV ${newStats.maxHp})` : '';
    this.logText.setText(`✨ FUSION RÉUSSIE !${statsStr}`).setColor('#00ff00');

    this.time.delayedCall(1500, () => {
      this.scene.restart();
    });
  }
}