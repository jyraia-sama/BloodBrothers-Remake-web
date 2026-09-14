import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { UNITS_DATABASE } from '../database.js';

export class DeckScene extends Phaser.Scene {
  constructor() { super({ key: 'DeckScene' }); }

  create() {
    this.add.text(400, 35, 'GESTION DU DECK', { fontSize: '26px', color: '#3355aa', fontStyle: 'bold' }).setOrigin(0.5);
    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    
    this.infoText = this.add.text(400, 70, 'Cliquez sur une carte pour la transférer | Doublons autorisés selon votre inventaire', { fontSize: '13px', color: '#aaaaaa' }).setOrigin(0.5);
    
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
      const nameText = this.add.text(x, y - 28, unit.name.split(' ')[0], { fontSize: '11px', color: '#fff' }).setOrigin(0.5);
      
      // Affichage de l'ATK et de la MAGIE (wis) sur la carte de l'équipe
      const atkText = this.add.text(x, y - 5, `ATK:${unit.atk}`, { fontSize: '10px', color: '#ffdd00' }).setOrigin(0.5);
      const wisText = this.add.text(x, y + 10, `WIS:${unit.wis}`, { fontSize: '10px', color: '#00ffff' }).setOrigin(0.5);
      
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
        this.renderInventory();
      });

      this.deckContainer.add([card, nameText, atkText, wisText, infoBtn, infoText]);
    });
  }

  renderInventory() {
    if (this.inventoryContainer) this.inventoryContainer.destroy();
    this.inventoryContainer = this.add.container(0, 0);
    this.inventoryContainer.add(this.add.text(400, 245, 'RÉSERVE / INVENTAIRE', { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5));
    
    PLAYER_DATA.inventory.forEach((unitKey, index) => {
      const unit = UNITS_DATABASE[unitKey];
      const x = 100 + (index % 7) * 100, y = 310 + Math.floor(index / 7) * 100;
      
      const countInDeck = PLAYER_DATA.deck.filter(k => k === unitKey).length;
      const countInInventory = PLAYER_DATA.inventory.filter(k => k === unitKey).length;
      const limitReached = countInDeck >= countInInventory;
      
      const cardColor = limitReached ? 0x444444 : unit.color;
      const strokeColor = limitReached ? 0x666666 : 0xaaaaaa;

      const card = this.add.rectangle(x, y, 80, 85, cardColor).setStrokeStyle(1, strokeColor).setInteractive({ useHandCursor: true });
      const nameText = this.add.text(x, y - 20, unit.name.split(' ')[0], { fontSize: '10px', color: limitReached ? '#888888' : '#fff' }).setOrigin(0.5);
      const rarityText = this.add.text(x, y + 20, `[${unit.rarity}]`, { fontSize: '11px', color: limitReached ? '#888888' : '#ffdd00' }).setOrigin(0.5);
      
      const infoBtn = this.add.circle(x + 28, y - 30, 10, 0x111111).setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true });
      const infoText = this.add.text(x + 28, y - 30, '?', { fontSize: '10px', color: '#fff' }).setOrigin(0.5);
      
      infoBtn.on('pointerdown', (pointer) => {
        pointer.event.stopPropagation();
        this.showUnitDetails(unit);
      });

      card.on('pointerdown', () => {
        if (limitReached) {
          this.infoText.setText('Vous avez déjà équipé tous vos exemplaires de cette unité !').setColor('#ff4444');
          return;
        }

        if (PLAYER_DATA.deck.length < 5) { 
          PLAYER_DATA.deck.push(unitKey); 
          saveGameData(); 
          this.renderDeck(); 
          this.renderInventory();
          this.infoText.setText('Cliquez sur une carte pour la transférer | Doublons autorisés selon votre inventaire').setColor('#aaaaaa');
        } else { 
          this.infoText.setText('Deck plein (5/5) ! Retirez une carte d\'abord.').setColor('#ff4444'); 
        }
      });

      this.inventoryContainer.add([card, nameText, rarityText, infoBtn, infoText]);
    });
  }

  showUnitDetails(unit) {
    if (this.modalContainer) this.modalContainer.destroy();

    this.modalContainer = this.add.container(0, 0);

    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7).setInteractive();
    const panel = this.add.rectangle(400, 300, 360, 400, 0x222233).setStrokeStyle(2, 0xffffff);

    const title = this.add.text(400, 130, `${unit.name} [${unit.rarity}]`, { fontSize: '20px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);
    
    // Intégration de la statistique magique (WIS) dans la fenêtre modale
    const statsStr = `❤️ HP : ${unit.hp} / ${unit.maxHp}\n⚔️ ATK : ${unit.atk}\n🔮 WIS : ${unit.wis}\n🛡️ DEF : ${unit.def}\n💨 AGI : ${unit.agi}`;
    const statsText = this.add.text(260, 175, statsStr, { fontSize: '15px', color: '#ffffff', lineSpacing: 6 });

    const skillTitle = this.add.text(400, 315, `Compétence : ${unit.skill ? unit.skill.name : 'Aucune'}`, { fontSize: '15px', color: '#00ffff', fontStyle: 'bold' }).setOrigin(0.5);
    const skillDesc = this.add.text(400, 345, `Chances de déclenchement : ${unit.skill ? (unit.skill.chance * 100) + '%' : 'N/A'}`, { fontSize: '13px', color: '#cccccc' }).setOrigin(0.5);

    const closeBtn = this.add.rectangle(400, 440, 140, 35, 0xaa2222).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    const closeText = this.add.text(400, 440, 'Fermer', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    closeBtn.on('pointerdown', () => this.modalContainer.destroy());
    overlay.on('pointerdown', () => this.modalContainer.destroy());

    this.modalContainer.add([overlay, panel, title, statsText, skillTitle, skillDesc, closeBtn, closeText]);
  }
}