import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { UNITS_DATABASE, EQUIPMENT_DATABASE } from '../database.js';

export class EquipmentScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EquipmentScene' });
    this.selectedUnitIndex = null;
    this.selectedSlot = null; // 'weapon', 'armor', 'relic'
  }

  create() {
    this.add.text(400, 30, 'GESTION DES ÉQUIPEMENTS & SOCKETS', { fontSize: '20px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);
    this.infoText = this.add.text(400, 70, 'Sélectionnez une unité de votre inventaire', { fontSize: '13px', color: '#ffffff' }).setOrigin(0.5);

    // Bouton Retour
    const backBtn = this.add.rectangle(80, 30, 100, 30, 0x444466).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(80, 30, '‹ Menu', { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    // Slots d'équipement de l'unité sélectionnée (Affichés au centre)
    this.slotWeapon = this.createSlotBox(250, 150, 'Arme', 'weapon');
    this.slotArmor = this.createSlotBox(400, 150, 'Armure', 'armor');
    this.slotRelic = this.createSlotBox(550, 150, 'Relique', 'relic');

    this.renderInventory();
  }

  createSlotBox(x, y, label, slotType) {
    const box = this.add.rectangle(x, y, 120, 80, 0x222233).setStrokeStyle(2, 0x888888).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, `${label}\n(Vide)`, { fontSize: '11px', color: '#aaaaaa', align: 'center' }).setOrigin(0.5);

    box.on('pointerdown', () => {
      if (this.selectedUnitIndex !== null) {
        this.selectedSlot = slotType;
        this.renderInventory();
      }
    });

    return { box, text, type: slotType };
  }

  renderInventory() {
    if (this.inventoryContainer) this.inventoryContainer.destroy();
    this.inventoryContainer = this.add.container(0, 240);

    // Mettre à jour l'affichage des 3 slots d'équipement de l'unité active
    if (this.selectedUnitIndex !== null) {
      const unitKey = PLAYER_DATA.inventory[this.selectedUnitIndex];
      const unit = UNITS_DATABASE[unitKey];

      [this.slotWeapon, this.slotArmor, this.slotRelic].forEach(slot => {
        const equippedKey = unit.equipment[slot.type];
        if (equippedKey) {
          const eq = EQUIPMENT_DATABASE[equippedKey];
          slot.box.setFillStyle(0x334433);
          slot.box.setStrokeStyle(2, this.selectedSlot === slot.type ? 0x00ff00 : 0x00aa00);
          slot.text.setText(`${eq.name}\n[${eq.rarity}]`).setColor('#00ff00');
        } else {
          slot.box.setFillStyle(0x222233);
          slot.box.setStrokeStyle(2, this.selectedSlot === slot.type ? 0x00ff00 : 0x888888);
          slot.text.setText(`${slot.type.toUpperCase()}\n(Vide)`).setColor('#aaaaaa');
        }
      });
    }

    // Affichage section Inventaire Unités ou Équipements selon l'étape
    if (this.selectedUnitIndex === null) {
      this.add.text(400, 10, '--- CHOISISSEZ UNE UNITÉ ---', { fontSize: '12px', color: '#888888' }).setOrigin(0.5);
      
      PLAYER_DATA.inventory.forEach((unitKey, index) => {
        const unit = UNITS_DATABASE[unitKey];
        const col = index % 6;
        const row = Math.floor(index / 6);
        const x = 90 + col * 124;
        const y = 40 + row * 105;

        const card = this.add.rectangle(x, y, 100, 90, unit.color).setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true });
        const nameText = this.add.text(x, y - 25, unit.name.split(' ')[0], { fontSize: '11px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        const lvlText = this.add.text(x, y - 5, `Niv. ${unit.level}`, { fontSize: '10px', color: '#ffdd00' }).setOrigin(0.5);
        const statsText = this.add.text(x, y + 15, `⚔️${unit.atk} 🛡️${unit.def}`, { fontSize: '9px', color: '#ffffff' }).setOrigin(0.5);

        this.inventoryContainer.add([card, nameText, lvlText, statsText]);
        card.on('pointerdown', () => {
          this.selectedUnitIndex = index;
          this.selectedSlot = 'weapon'; // Sélectionne l'arme par défaut
          this.renderInventory();
        });
      });
    } else if (this.selectedSlot !== null) {
      this.add.text(400, 10, `--- CHOISISSEZ UN ÉQUIPEMENT (${this.selectedSlot.toUpperCase().toUpperCase()}) --- (Clic unité pour changer)`, { fontSize: '11px', color: '#ffdd00' }).setOrigin(0.5);

      // Filtrer les équipements disponibles du type sélectionné
      const availableEq = PLAYER_DATA.equipmentInventory.map((key, idx) => ({ key, idx })).filter(item => {
        const eq = EQUIPMENT_DATABASE[item.key];
        return eq.type === this.selectedSlot;
      });

      // Bouton pour déséquiper
      const unequipBtn = this.add.rectangle(400, 45, 180, 30, 0x662222).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
      this.add.text(400, 45, '❌ Retirer l\'équipement', { fontSize: '11px', color: '#ffffff' }).setOrigin(0.5);
      unequipBtn.on('pointerdown', () => {
        const unitKey = PLAYER_DATA.inventory[this.selectedUnitIndex];
        const unit = UNITS_DATABASE[unitKey];
        if (unit.equipment[this.selectedSlot]) {
          PLAYER_DATA.equipmentInventory.push(unit.equipment[this.selectedSlot]);
          unit.equipment[this.selectedSlot] = null;
          saveGameData();
          this.renderInventory();
        }
      });
      this.inventoryContainer.add([unequipBtn, this.add.text(400, 45, '❌ Retirer l\'équipement', { fontSize: '11px', color: '#ffffff' }).setOrigin(0.5)]);

      availableEq.forEach((item, index) => {
        const eq = EQUIPMENT_DATABASE[item.key];
        const col = index % 5;
        const row = Math.floor(index / 5);
        const x = 120 + col * 140;
        const y = 100 + row * 90;

        const card = this.add.rectangle(x, y, 120, 75, 0x333344).setStrokeStyle(2, eq.color).setInteractive({ useHandCursor: true });
        const nameText = this.add.text(x, y - 20, eq.name, { fontSize: '10px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        const rareText = this.add.text(x, y - 2, `[${eq.rarity}]`, { fontSize: '9px', color: '#ffdd00' }).setOrigin(0.5);
        const bonusText = this.add.text(x, y + 18, `Bonus: +${eq.bonusValue}`, { fontSize: '9px', color: '#00ff00' }).setOrigin(0.5);

        this.inventoryContainer.add([card, nameText, rareText, bonusText]);

        card.on('pointerdown', () => {
          const unitKey = PLAYER_DATA.inventory[this.selectedUnitIndex];
          const unit = UNITS_DATABASE[unitKey];

          // Remettre l'ancien équipement dans l'inventaire si présent
          if (unit.equipment[this.selectedSlot]) {
            PLAYER_DATA.equipmentInventory.push(unit.equipment[this.selectedSlot]);
          }

          // Équiper le nouveau
          unit.equipment[this.selectedSlot] = item.key;
          PLAYER_DATA.equipmentInventory.splice(item.idx, 1);

          saveGameData();
          this.renderInventory();
        });
      });
    }
  }
}