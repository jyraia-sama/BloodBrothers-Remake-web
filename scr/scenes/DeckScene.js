import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { UNITS_DATABASE } from '../database.js';

export class DeckScene extends Phaser.Scene {
  constructor() { super({ key: 'DeckScene' }); }

  create() {
    this.add.text(400, 35, 'GESTION DU DECK', { fontSize: '26px', color: '#3355aa', fontStyle: 'bold' }).setOrigin(0.5);
    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    
    this.infoText = this.add.text(400, 70, 'Cliquez sur une carte pour la transférer | Clique sur [?] pour voir la fiche', { fontSize: '13px', color: '#aaaaaa' }).setOrigin(0.5);
    
    this.renderDeck();
    this.renderInventory();
  }

  renderDeck() {
    if (this.deckContainer) this.deckContainer.destroy();
    this.deckContainer = this.add.container(0, 0);
    this.deckContainer.add(this.add.text(400, 105, `ÉQUIPE ÉQUIPÉE (${PLAYER_DATA.deck.length}/5)`, { fontSize: '15px', color: '#00ff00', fontStyle: 'bold' }).setOrigin(0.5));
    
    PLAYER_DATA.deck.forEach((unitKey, index) => {
      const unit = UNITS_DATABASE[unitKey];
      const x = 150 + index * 125, y = 165;
      
      const card = this.add.rectangle(x, y, 90, 95, unit.color).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
      const nameText = this.add.text(x, y - 25, unit.name.split(' ')[0], { fontSize: '11px', color: '#fff' }).setOrigin(0.5);
      const atkText = this.add.text(x, y + 25, `ATK:${unit.atk}`, { fontSize: '11px', color: '#ffdd00' }).setOrigin(0.5);
      
      // Bouton Fiche Détails [?]
      const infoBtn = this.add.circle(x + 32, y - 35, 11, 0x111111).setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true });
      const infoText = this.add.text(x + 32, y - 35, '?', { fontSize: '11px', color: '#fff' }).setOrigin(0.5);
      
      infoBtn.on('pointerdown', (pointer) => {
        pointer.event.stopPropagation();
        this.showUnitDetails(unit);
      });

      card.on('pointerdown', () => { 
        PLAYER_DATA.deck.splice(index, 1); 
        saveGameData(); 
        this.renderDeck(); 
      });

      this.deckContainer.add([card, nameText, atkText, infoBtn, infoText]);
    });
  }

  renderInventory() {
    if (this.inventoryContainer) this.inventoryContainer.destroy();
    this.inventoryContainer = this.add.container(0, 0);
    this.inventoryContainer.add(this.add.text(400, 245, 'RÉSERVE / INVENTAIRE', { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5));
    
    PLAYER_DATA.inventory.forEach((unitKey, index) => {
      const unit = UNITS_DATABASE[unitKey];
      const x = 100 + (index % 7) * 100, y = 310 + Math.floor(index / 7) * 100;
      
      const card = this.add.rectangle(x, y, 80, 85, unit.color).setStrokeStyle(1, 0xaaaaaa).setInteractive({ useHandCursor: true });
      const nameText = this.add.text(x, y - 20, unit.name.split(' ')[0], { fontSize: '10px', color: '#fff' }).setOrigin(0.5);
      const rarityText = this.add.text(x, y + 20, `[${unit.rarity}]`, { fontSize: '11px', color: '#ffdd00' }).setOrigin(0.5);
      
      // Bouton Fiche Détails [?]
      const infoBtn = this.add.circle(x + 28, y - 30, 10, 0x111111).setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true });
      const infoText = this.add.text(x + 28, y - 30, '?', { fontSize: '10px', color: '#fff' }).setOrigin(0.5);
      
      infoBtn.on('pointerdown', (pointer) => {
        pointer.event.stopPropagation();
        this.showUnitDetails(unit);
      });

      card.on('pointerdown', () => {
        if (PLAYER_DATA.deck.length < 5) { 
          PLAYER_DATA.deck.push(unitKey); 
          saveGameData(); 
          this.renderDeck(); 
        } else { 
          this.infoText.setText('Deck plein ! Retirez une carte d\'abord.').setColor('#ff4444'); 
        }
      });

      this.inventoryContainer.add([card, nameText, rarityText, infoBtn, infoText]);
    });
  }

  showUnitDetails(unit) {
    if (this.modalContainer) this.modalContainer.destroy();

    this.modalContainer = this.add.container(0, 0);

    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7).setInteractive();
    const panel = this.add.rectangle(400, 300, 360, 380, 0x222233).setStrokeStyle(2, 0xffffff);

    const title = this.add.text(400, 140, `${unit.name} [${unit.rarity}]`, { fontSize: '20px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);
    
    const statsStr = `❤️ HP : ${unit.hp} / ${unit.maxHp}\n⚔️ ATK : ${unit.atk}\n🛡️ DEF : ${unit.def}\n💨 AGI : ${unit.agi}`;
    const statsText = this.add.text(260, 190, statsStr, { fontSize: '15px', color: '#ffffff', lineSpacing: 8 });

    const skillTitle = this.add.text(400, 310, `Compétence : ${unit.skill ? unit.skill.name : 'Aucune'}`, { fontSize: '15px', color: '#00ffff', fontStyle: 'bold' }).setOrigin(0.5);
    const skillDesc = this.add.text(400, 340, `Chances de déclenchement : ${unit.skill ? (unit.skill.chance * 100) + '%' : 'N/A'}`, { fontSize: '13px', color: '#cccccc' }).setOrigin(0.5);

    const closeBtn = this.add.rectangle(400, 420, 140, 35, 0xaa2222).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    const closeText = this.add.text(400, 420, 'Fermer', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    closeBtn.on('pointerdown', () => this.modalContainer.destroy());
    overlay.on('pointerdown', () => this.modalContainer.destroy());

    this.modalContainer.add([overlay, panel, title, statsText, skillTitle, skillDesc, closeBtn, closeText]);
  }
}