import { PLAYER_DATA, saveGameData } from '../saveSystem.js';
import { HEROES_DATABASE } from '../database.js';

export class HeroSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HeroSelectScene' });
  }

  create() {
    this.add.text(400, 35, 'CHOISISSEZ VOTRE HÉROS DE DÉPART', { fontSize: '22px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);

    const keys = Object.keys(HEROES_DATABASE);
    keys.forEach((key, index) => {
      const hero = HEROES_DATABASE[key];
      const col = index % 4;
      const row = Math.floor(index / 4);

      const x = 130 + col * 180;
      const y = 140 + row * 220;

      const card = this.add.rectangle(x, y, 160, 200, hero.color).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });

      this.add.text(x, y - 75, hero.name, { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(x, y - 55, `[${hero.race}]`, { fontSize: '11px', color: '#ffdd00' }).setOrigin(0.5);

      const stats = `❤️ HP: ${hero.hp}\n⚔️ ATK: ${hero.atk}\n🛡️ DEF: ${hero.def}\n💨 AGI: ${hero.agi}`;
      this.add.text(x - 65, y - 35, stats, { fontSize: '11px', color: '#ffffff', lineSpacing: 4 });

      this.add.text(x, y + 65, hero.skill.name, { fontSize: '10px', color: '#00ffff', fontStyle: 'bold' }).setOrigin(0.5);

      card.on('pointerdown', () => this.selectHero(key));
      card.on('pointerover', () => card.setAlpha(0.8));
      card.on('pointerout', () => card.setAlpha(1.0));
    });
  }

  selectHero(heroKey) {
    PLAYER_DATA.inventory.unshift(heroKey);
    PLAYER_DATA.deck.unshift(heroKey);
    PLAYER_DATA.hasChosenHero = true;
    saveGameData();

    this.scene.start('MenuScene');
  }
}