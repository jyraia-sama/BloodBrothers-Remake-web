import {
  PLAYER_DATA,
  STAMINA_REGEN_INTERVAL,
  saveGameData,
  resetGameData
} from '../saveSystem.js';

import { CHANGELOG_DATA } from './ChangelogData.js';
import { getAccountProgress, accountXpForNextLevel, MAX_ACCOUNT_LEVEL } from '../levelSystem.js';

export class MenuScene extends Phaser.Scene {

  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {
    this.load.image('menuBg', 'src/assets/images/menu_BBRW.jpg');
  }

  create() {
    if (!PLAYER_DATA.hasChosenHero) {
      this.scene.start('HeroSelectScene');
      return;
    }

    const COLORS = {
      blood: 0x9e1b32,
      bloodBright: 0xe52b45,
      steel: 0x243b55,
      steelBright: 0x4f81a8,
      purple: 0x45236b,
      purpleBright: 0x9b5de5,
      bronze: 0x6b4423,
      bronzeBright: 0xc78b3c,
      danger: 0x711c28,
      dangerBright: 0xe33b4f,
      background2: 0x10131d,
      darkGrey: 0x3a3f4b,
      gold: 0xd9a441
    };

    // Fond
    this.add.image(400, 300, 'menuBg')
      .setDisplaySize(800, 600)
      .setDepth(-10);

    // Titre
    this.add.text(400, 58, 'BLOOD BROTHERS', {
      fontSize: '34px',
      color: '#e52b45',
      fontStyle: 'bold',
      stroke: '#320812',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 8, stroke: true, fill: true }
    }).setOrigin(0.5);

    this.add.rectangle(400, 88, 220, 2, COLORS.blood).setOrigin(0.5).setAlpha(0.8);

    this.add.text(400, 104, 'REMAKE WEB', {
      fontSize: '12px',
      color: '#e52b45',
      fontStyle: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5);

    // Panneau des stats
    this.add.rectangle(400, 135, 340, 44, COLORS.background2, 0.85)
      .setStrokeStyle(1, COLORS.darkGrey);

    this.add.rectangle(245, 135, 3, 28, COLORS.gold);
    this.add.rectangle(555, 135, 3, 28, COLORS.gold);

    this.uiText = this.add.text(400, 128, '', {
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.timerText = this.add.text(400, 149, '', {
      fontSize: '10px',
      color: '#d9a441'
    }).setOrigin(0.5);

    // --- Niveau de compte + barre de progression ---
    this.accountText = this.add.text(400, 168, '', {
      fontSize: '11px',
      color: '#7fd4ff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.accountBarBg = this.add.rectangle(400, 182, 240, 6, 0x0d1018, 0.9)
      .setStrokeStyle(1, COLORS.darkGrey);
    this.accountBarFill = this.add.rectangle(280, 182, 1, 6, 0x4f9fd8).setOrigin(0, 0.5);

    // Boutons du menu
    this.createMenuButton(400, 215, '🗺️', 'AVENTURE', '3 Actes', COLORS.blood, COLORS.bloodBright, () => {
      this.scene.start('ChapterSelectScene');
    });

    this.createMenuButton(400, 288, '🛡️', 'GESTION DU DECK', 'Gérer vos cartes', COLORS.steel, COLORS.steelBright, () => {
      this.scene.start('DeckScene');
    });

    this.createMenuButton(400, 361, '🔮', 'INVOCATIONS', 'Pacte mystique', COLORS.purple, COLORS.purpleBright, () => {
      this.scene.start('GachaScene');
    });

    this.createMenuButton(400, 434, '🔥', 'AUTEL DE FUSION', 'Fusionner vos cartes', COLORS.bronze, COLORS.bronzeBright, () => {
      this.scene.start('FusionScene');
    });

    this.createMenuButton(400, 507, '⚠️', 'EFFACER LA PARTIE', 'Réinitialiser votre progression', COLORS.danger, COLORS.dangerBright, () => {
      resetGameData();
      this.scene.start('HeroSelectScene');
    });

    // Boutons annexes (Mises à jour et Admin)
    this.createUpdateButton(695, 570, () => {
      this.showChangelogModal();
    });

    this.createAdminButton(765, 30, () => {
      this.showAdminModal();
    });

    // Timer
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.updateStaminaTimer();
        this.applyAdminCheats();
      },
      loop: true
    });

    this.updateUI();
  }

  applyAdminCheats() {
    if (typeof PLAYER_DATA.adminGoldActive === 'undefined') PLAYER_DATA.adminGoldActive = false;
    if (typeof PLAYER_DATA.adminBuffActive === 'undefined') PLAYER_DATA.adminBuffActive = false;

    if (PLAYER_DATA.adminGoldActive) {
      PLAYER_DATA.gold = 9999;
    }
  }

  showAdminModal() {
    if (this.modalContainer) {
      this.modalContainer.destroy();
    }

    this.modalContainer = this.add.container(0, 0);
    this.modalContainer.setDepth(150);

    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setInteractive();
    const panel = this.add.rectangle(400, 300, 480, 320, 0x10131d).setStrokeStyle(2, 0xe52b45);

    this.add.rectangle(400, 160, 400, 2, 0x9e1b32);

    const title = this.add.text(400, 135, '⚙️ MODE ADMINISTRATEUR', {
      fontSize: '18px',
      color: '#ffd86b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const cbGoldBg = this.add.rectangle(230, 220, 24, 24, 0x252a38).setStrokeStyle(2, 0x9da3b0).setInteractive({ useHandCursor: true });
    const cbGoldCheck = this.add.text(230, 220, '✓', { fontSize: '16px', color: '#ffd86b', fontStyle: 'bold' }).setOrigin(0.5);
    cbGoldCheck.setVisible(!!PLAYER_DATA.adminGoldActive);

    const lblGold = this.add.text(260, 220, 'Activer l\'or à 9999', { fontSize: '13px', color: '#ffffff' }).setOrigin(0, 0.5);

    const toggleGold = () => {
      PLAYER_DATA.adminGoldActive = !PLAYER_DATA.adminGoldActive;
      cbGoldCheck.setVisible(PLAYER_DATA.adminGoldActive);
      this.applyAdminCheats();
      saveGameData();
      this.updateUI();
    };
    cbGoldBg.on('pointerdown', toggleGold);
    lblGold.setInteractive({ useHandCursor: true }).on('pointerdown', toggleGold);

    const cbBuffBg = this.add.rectangle(230, 275, 24, 24, 0x252a38).setStrokeStyle(2, 0x9da3b0).setInteractive({ useHandCursor: true });
    const cbBuffCheck = this.add.text(230, 275, '✓', { fontSize: '16px', color: '#ffd86b', fontStyle: 'bold' }).setOrigin(0.5);
    cbBuffCheck.setVisible(!!PLAYER_DATA.adminBuffActive);

    const lblBuff = this.add.text(260, 275, 'Statistiques de toutes les cartes x2', { fontSize: '13px', color: '#ffffff' }).setOrigin(0, 0.5);

    const toggleBuff = () => {
      PLAYER_DATA.adminBuffActive = !PLAYER_DATA.adminBuffActive;
      cbBuffCheck.setVisible(PLAYER_DATA.adminBuffActive);
      saveGameData();
    };
    cbBuffBg.on('pointerdown', toggleBuff);
    lblBuff.setInteractive({ useHandCursor: true }).on('pointerdown', toggleBuff);

    const closeBtn = this.add.rectangle(400, 375, 140, 35, 0x252a38)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x9da3b0);

    const closeText = this.add.text(400, 375, 'FERMER', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    closeBtn.on('pointerover', () => {
      closeBtn.setFillStyle(0x3a4052);
      closeBtn.setStrokeStyle(1, 0xffffff);
    });
    closeBtn.on('pointerout', () => {
      closeBtn.setFillStyle(0x252a38);
      closeBtn.setStrokeStyle(1, 0x9da3b0);
    });

    const closeModal = () => {
      if (this.modalContainer) {
        this.modalContainer.destroy();
        this.modalContainer = null;
      }
    };

    closeBtn.on('pointerdown', closeModal);
    overlay.on('pointerdown', closeModal);

    this.modalContainer.add([
      overlay, panel, title,
      cbGoldBg, cbGoldCheck, lblGold,
      cbBuffBg, cbBuffCheck, lblBuff,
      closeBtn, closeText
    ]);
  }

  createAdminButton(x, y, callback) {
    const btnBg = this.add.rectangle(x, y, 32, 32, 0x000000, 0.3)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x444455);

    const icon = this.add.text(x, y, '⚙️', { fontSize: '14px' }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0xe52b45, 0.5);
      btnBg.setStrokeStyle(1, 0xffd86b);
    });
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x000000, 0.3);
      btnBg.setStrokeStyle(1, 0x444455);
    });
    btnBg.on('pointerdown', callback);
  }

  createMenuButton(x, y, icon, title, subtitle, normalColor, hoverColor, callback) {
    const container = this.add.container(x, y);

    const shadow = this.add.rectangle(0, 4, 350, 50, 0x000000, 0.7);
    const background = this.add.rectangle(0, 0, 350, 50, normalColor, 0.85).setStrokeStyle(1, normalColor);
    const inner = this.add.rectangle(0, 0, 342, 42, 0x0d1018, 0.92);
    const sideBar = this.add.rectangle(-171, 0, 5, 42, normalColor);
    const iconText = this.add.text(-140, 0, icon, { fontSize: '22px' }).setOrigin(0.5);
    const titleText = this.add.text(-105, -7, title, { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5);
    const subtitleText = this.add.text(-105, 11, subtitle, { fontSize: '9px', color: '#8d94a3' }).setOrigin(0, 0.5);
    const arrow = this.add.text(155, 0, '›', { fontSize: '25px', color: '#6f7582' }).setOrigin(0.5);

    container.add([shadow, background, inner, sideBar, iconText, titleText, subtitleText, arrow]);

    const hitArea = this.add.rectangle(x, y, 350, 50, 0xffffff, 0).setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      background.setFillStyle(hoverColor, 0.9);
      background.setStrokeStyle(2, hoverColor);
      sideBar.setFillStyle(hoverColor);
      arrow.setColor('#' + hoverColor.toString(16).padStart(6, '0'));
      this.tweens.add({ targets: container, scaleX: 1.025, scaleY: 1.025, duration: 100, ease: 'Power2' });
    });

    hitArea.on('pointerout', () => {
      background.setFillStyle(normalColor, 0.85);
      background.setStrokeStyle(1, normalColor);
      sideBar.setFillStyle(normalColor);
      arrow.setColor('#6f7582');
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100, ease: 'Power2' });
    });

    hitArea.on('pointerdown', () => {
      this.tweens.add({ targets: container, scaleX: 0.97, scaleY: 0.97, duration: 60, yoyo: true, ease: 'Power2' });
      callback();
    });
  }

  createUpdateButton(x, y, callback) {
    const background = this.add.rectangle(x, y, 140, 32, 0x171b26, 0.95)
      .setStrokeStyle(1, 0x6b5a2d)
      .setInteractive({ useHandCursor: true });

    const icon = this.add.text(x - 52, y, '📜', { fontSize: '13px' }).setOrigin(0.5);
    const text = this.add.text(x + 8, y, 'MISES À JOUR', { fontSize: '10px', color: '#d9a441', fontStyle: 'bold' }).setOrigin(0.5);

    background.on('pointerover', () => {
      background.setFillStyle(0x292315, 1);
      background.setStrokeStyle(1, 0xffd86b);
      text.setColor('#ffdf82');
    });

    background.on('pointerout', () => {
      background.setFillStyle(0x171b26, 0.95);
      background.setStrokeStyle(1, 0x6b5a2d);
      text.setColor('#d9a441');
    });

    background.on('pointerdown', callback);
  }

  showChangelogModal() {
    if (this.modalContainer) {
      this.modalContainer.destroy();
    }

    this.modalContainer = this.add.container(0, 0);
    this.modalContainer.setDepth(150);

    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.82).setInteractive();
    const panel = this.add.rectangle(400, 300, 550, 460, 0x10131d).setStrokeStyle(2, 0xd9a441);

    this.add.rectangle(400, 92, 480, 2, 0x9e1b32);

    const title = this.add.text(400, 70, 'NOTES DE MISE À JOUR', {
      fontSize: '20px',
      color: '#ffd86b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    let changelogTextContent = "";
    CHANGELOG_DATA.forEach((entry, i) => {
      changelogTextContent += `📅 ${entry.date}\n`;
      entry.points.forEach(point => {
        changelogTextContent += ` • ${point}\n`;
      });
      if (i < CHANGELOG_DATA.length - 1) {
        changelogTextContent += "\n";
      }
    });

    const contentText = this.add.text(160, 115, changelogTextContent, {
      fontSize: '12px',
      color: '#cccccc',
      lineSpacing: 4,
      wordWrap: { width: 480 }
    });

    const closeBtn = this.add.rectangle(400, 490, 170, 38, 0x252a38)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x9da3b0);

    const closeText = this.add.text(400, 490, '‹  RETOUR AU MENU', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    closeBtn.on('pointerover', () => {
      closeBtn.setFillStyle(0x3a4052);
      closeBtn.setStrokeStyle(1, 0xffffff);
    });

    closeBtn.on('pointerout', () => {
      closeBtn.setFillStyle(0x252a38);
      closeBtn.setStrokeStyle(1, 0x9da3b0);
    });

    const closeModal = () => {
      if (this.modalContainer) {
        this.modalContainer.destroy();
        this.modalContainer = null;
      }
    };

    closeBtn.on('pointerdown', closeModal);
    overlay.on('pointerdown', closeModal);

    this.modalContainer.add([overlay, panel, title, contentText, closeBtn, closeText]);
  }

  updateStaminaTimer() {
    if (PLAYER_DATA.stamina < PLAYER_DATA.maxStamina) {
      const now = Date.now();
      const elapsed = now - PLAYER_DATA.lastStaminaUpdate;
      if (elapsed >= STAMINA_REGEN_INTERVAL) {
        PLAYER_DATA.stamina += 1;
        PLAYER_DATA.lastStaminaUpdate = now;
        saveGameData();
      }
    }
    this.updateUI();
  }

  updateAccountUI() {
    if (!this.accountText) return;

    const level = PLAYER_DATA.accountLevel || 1;
    const isMax = level >= MAX_ACCOUNT_LEVEL;

    const xpStr = isMax
      ? 'NIVEAU MAXIMUM'
      : `${PLAYER_DATA.accountXp || 0} / ${accountXpForNextLevel(level)} XP`;
    this.accountText.setText(`🎖️ Compte Nv. ${level}   —   ${xpStr}`);

    const progress = getAccountProgress(PLAYER_DATA);
    const fullWidth = 240;
    this.accountBarFill.width = Math.max(1, fullWidth * progress);
    this.accountBarFill.setFillStyle(isMax ? 0xd9a441 : 0x4f9fd8);
  }

  updateUI() {
    this.applyAdminCheats();
    this.uiText.setText(`⚡ Stamina: ${PLAYER_DATA.stamina}/${PLAYER_DATA.maxStamina}   |   💰 Or: ${PLAYER_DATA.gold}`);
    this.updateAccountUI();

    if (PLAYER_DATA.stamina < PLAYER_DATA.maxStamina) {
      const now = Date.now();
      const elapsed = now - PLAYER_DATA.lastStaminaUpdate;
      const timeLeft = Math.max(0, STAMINA_REGEN_INTERVAL - elapsed);
      const totalSeconds = Math.ceil(timeLeft / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      this.timerText.setText(`Prochaine stamina dans : ${timeString}`);
    } else {
      this.timerText.setText('');
    }
  }
}