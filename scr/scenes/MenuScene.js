import { PLAYER_DATA, STAMINA_REGEN_INTERVAL, saveGameData, resetGameData } from '../saveSystem.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    if (!PLAYER_DATA.hasChosenHero) {
      this.scene.start('HeroSelectScene');
      return;
    }

    this.add.text(400, 70, 'BLOOD BROTHERS', { fontSize: '40px', color: '#ff2222', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(400, 115, 'REMAKE WEB', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);

    this.add.rectangle(400, 165, 520, 40, 0x222233).setStrokeStyle(1, 0x555577);
    this.uiText = this.add.text(400, 165, '', { fontSize: '15px', color: '#ffffff' }).setOrigin(0.5);

    this.createButton(400, 230, '🗺️  Aventure (Chapitres)', 0xaa2222, () => this.scene.start('ChapterSelectScene'));
    this.createButton(400, 300, '🛡️  Gestion du Deck', 0x3355aa, () => this.scene.start('DeckScene'));
    this.createButton(400, 370, '🔮  Invocations (Pacte)', 0x8800aa, () => this.scene.start('GachaScene'));
    this.createButton(400, 460, '⚠️  Effacer la partie', 0x552222, () => {
      resetGameData();
      this.scene.start('HeroSelectScene');
    });

    this.time.addEvent({
      delay: 1000,
      callback: () => this.updateStaminaTimer(),
      loop: true
    });

    this.updateUI();
  }

  updateStaminaTimer() {
    if (PLAYER_DATA.stamina < PLAYER_DATA.maxStamina) {
      const now = Date.now();
      const elapsed = now - PLAYER_DATA.lastStaminaUpdate;
      if (elapsed >= STAMINA_REGEN_INTERVAL) {
        PLAYER_DATA.stamina += 1;
        PLAYER_DATA.lastStaminaUpdate = now;
        saveGameData();
        this.updateUI();
      }
    }
  }

  updateUI() {
    this.uiText.setText(`⚡ Stamina: ${PLAYER_DATA.stamina}/${PLAYER_DATA.maxStamina}   |   💰 Or: ${PLAYER_DATA.gold}`);
  }

  createButton(x, y, label, color, callback) {
    const btnBg = this.add.rectangle(x, y, 280, 45, color).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff);
    this.add.text(x, y, label, { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    btnBg.on('pointerdown', callback);
    btnBg.on('pointerover', () => btnBg.setAlpha(0.8));
    btnBg.on('pointerout', () => btnBg.setAlpha(1.0));
  }
}