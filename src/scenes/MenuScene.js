import {
  PLAYER_DATA,
  STAMINA_REGEN_INTERVAL,
  saveGameData,
  resetGameData
} from '../saveSystem.js';

import { CHANGELOG_DATA } from './ChangelogData.js';

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
      gold: 0xd9a441,
      goldBright: 0xffd86b,
      darkGrey: 0x3a3f4b,
      background2: 0x10131d,
      bloodBright: 0xe52b45,
      steelBright: 0x4f81a8,
      purpleBright: 0x9b5de5,
      bronzeBright: 0xc78b3c,
      dangerBright: 0xe33b4f,
    };

    // ==========================================================
    // FOND (Image principale)
    // ==========================================================
    this.add.image(400, 300, 'menuBg')
      .setDisplaySize(800, 600)
      .setDepth(-10);

    // ==========================================================
    // TITRE (Intégré dans le ciel rouge de l'image)
    // ==========================================================
    this.add.text(400, 58, 'BLOOD BROTHERS', {
      fontSize: '34px',
      color: '#e52b45',
      fontStyle: 'bold',
      stroke: '#320812',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 8, stroke: true, fill: true }
    }).setOrigin(0.5);

    this.add.rectangle(400, 88, 220, 2, 0x9e1b32).setOrigin(0.5).setAlpha(0.8);

    this.add.text(400, 104, 'REMAKE WEB', {
      fontSize: '12px',
      color: '#9da3b0',
      fontStyle: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5);


    // ==========================================================
    // RANGÉE D'ICÔNES UTILITAIRES (à l'intérieur du cadre, en haut)
    // Admin à gauche / Mises à jour à droite — symétriques
    // ==========================================================
    this.createIconButton(248, 128, '⚙️', 0x444455, () => {
      this.showAdminModal();
    });

    this.createIconButton(552, 128, '📜', 0x6b5a2d, () => {
      this.showChangelogModal();
    });


    // ==========================================================
    // PANNEAU DES STATS (dans le cadre, sous la rangée d'icônes)
    // ==========================================================
    this.add.rectangle(400, 176, 320, 40, COLORS.background2, 0.85)
      .setStrokeStyle(1, COLORS.darkGrey);

    this.add.rectangle(260, 176, 3, 28, COLORS.gold);
    this.add.rectangle(540, 176, 3, 28, COLORS.gold);

    this.uiText = this.add.text(400, 169, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.timerText = this.add.text(400, 189, '', {
      fontSize: '10px',
      color: '#d9a441'
    }).setOrigin(0.5);


    // ==========================================================
    // BOUTONS DU MENU (répartis dans la zone noire du cadre)
    // ==========================================================

    // 1. Aventure
    this.createMenuButton(400, 230, '🗺️', 'AVENTURE', 'Chapitres', COLORS.bloodBright, () => {
      this.scene.start('ChapterSelectScene');
    });

    // 2. Gestion du Deck
    this.createMenuButton(400, 304, '🛡️', 'GESTION DU DECK', 'Gérer vos cartes', COLORS.steelBright, () => {
      this.scene.start('DeckScene');
    });

    // 3. Invocations
    this.createMenuButton(400, 378, '🔮', 'INVOCATIONS', 'Pacte mystique', COLORS.purpleBright, () => {
      this.scene.start('GachaScene');
    });

    // 4. Autel de Fusion
    this.createMenuButton(400, 452, '🔥', 'AUTEL DE FUSION', 'Fusionner vos cartes', COLORS.bronzeBright, () => {
      this.scene.start('FusionScene');
    });

    // 5. Effacer la partie (discret, centré tout en bas du cadre)
    this.createSmallButton(400, 508, '⚠️ Effacer la partie', COLORS.dangerBright, () => {
      resetGameData();
      this.scene.start('HeroSelectScene');
    });


    // ==========================================================
    // TIMER STAMINA
    // ==========================================================
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        // updateStaminaTimer() appelle déjà updateUI(), qui applique
        // elle-même applyAdminCheats() : pas besoin de l'appeler deux fois.
        this.updateStaminaTimer();
      },
      loop: true
    });

    this.updateUI();
  }


  // ============================================================
  // LOGIQUE DES TRICHES ADMIN
  // ============================================================
  applyAdminCheats() {
    if (typeof PLAYER_DATA.adminGoldActive === 'undefined') {
      PLAYER_DATA.adminGoldActive = false;
    }
    if (typeof PLAYER_DATA.adminBuffActive === 'undefined') {
      PLAYER_DATA.adminBuffActive = false;
    }

    // Option Or à 9999
    if (PLAYER_DATA.adminGoldActive) {
      PLAYER_DATA.gold = 9999;
    }

    // Option Statistiques x2 : ce simple flag doit être lu par ton
    // système de combat/deck pour multiplier les stats par 2 —
    // MenuScene ne peut pas appliquer cet effet à ta place.
  }


  // ============================================================
  // FENÊTRE MODALE ADMINISTRATEUR
  // ============================================================
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

    // --- CASE À COCHER 1 : Or à 9999 ---
    const cbGoldBg = this.add.rectangle(230, 220, 24, 24, 0x252a38).setStrokeStyle(2, 0x9da3b0).setInteractive({ useHandCursor: true });
    const cbGoldCheck = this.add.text(230, 220, '✓', { fontSize: '16px', color: '#ffd86b', fontStyle: 'bold' }).setOrigin(0.5);
    cbGoldCheck.setVisible(!!PLAYER_DATA.adminGoldActive);

    const lblGold = this.add.text(260, 220, "Activer l'or infini à 9999", { fontSize: '13px', color: '#ffffff' }).setOrigin(0, 0.5);

    const toggleGold = () => {
      PLAYER_DATA.adminGoldActive = !PLAYER_DATA.adminGoldActive;
      cbGoldCheck.setVisible(PLAYER_DATA.adminGoldActive);
      this.applyAdminCheats();
      saveGameData();
      this.updateUI();
    };
    cbGoldBg.on('pointerdown', toggleGold);
    lblGold.setInteractive({ useHandCursor: true }).on('pointerdown', toggleGold);


    // --- CASE À COCHER 2 : Stats x2 ---
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


    // --- BOUTON FERMER ---
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


  // ============================================================
  // BOUTON ICÔNE GÉNÉRIQUE (admin / mises à jour)
  // ============================================================
  createIconButton(x, y, icon, hoverColor, callback) {
    const btnBg = this.add.rectangle(x, y, 30, 30, 0x000000, 0.45)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x444455);

    const iconText = this.add.text(x, y, icon, { fontSize: '14px' }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(hoverColor, 0.55);
      btnBg.setStrokeStyle(1, 0xffd86b);
    });
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x000000, 0.45);
      btnBg.setStrokeStyle(1, 0x444455);
    });
    btnBg.on('pointerdown', callback);
  }


  // ============================================================
  // CRÉATION D'UN BOUTON DE MENU
  // ============================================================
  createMenuButton(x, y, icon, title, subtitle, hoverColor, callback) {
    const container = this.add.container(x, y);

    const hitArea = this.add.rectangle(0, 0, 350, 48, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    const iconText = this.add.text(-135, 0, icon, { fontSize: '20px' }).setOrigin(0.5);

    const titleText = this.add.text(-100, -7, title, {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    const subtitleText = this.add.text(-100, 11, subtitle, {
      fontSize: '9px',
      color: '#b0b8c4'
    }).setOrigin(0, 0.5);

    const arrow = this.add.text(150, 0, '›', {
      fontSize: '22px',
      color: '#8d94a3'
    }).setOrigin(0.5);

    container.add([hitArea, iconText, titleText, subtitleText, arrow]);

    hitArea.on('pointerover', () => {
      titleText.setColor('#ffd86b');
      arrow.setColor('#ffd86b');
      this.tweens.add({
        targets: container,
        scaleX: 1.02,
        scaleY: 1.02,
        duration: 100,
        ease: 'Power2'
      });
    });

    hitArea.on('pointerout', () => {
      titleText.setColor('#ffffff');
      arrow.setColor('#8d94a3');
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Power2'
      });
    });

    hitArea.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.97,
        scaleY: 0.97,
        duration: 60,
        yoyo: true,
        ease: 'Power2'
      });
      callback();
    });
  }


  // ============================================================
  // PETIT BOUTON (Effacer la partie)
  // ============================================================
  createSmallButton(x, y, label, color, callback) {
    const btn = this.add.text(x, y, label, {
      fontSize: '11px',
      color: '#9da3b0',
      fontStyle: 'bold'
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#e33b4f'));
    btn.on('pointerout', () => btn.setColor('#9da3b0'));
    btn.on('pointerdown', callback);
  }


  // ============================================================
  // FENÊTRE CHANGELOG
  // ============================================================
  showChangelogModal() {
    if (this.modalContainer) {
      this.modalContainer.destroy();
    }

    this.modalContainer = this.add.container(0, 0);
    this.modalContainer.setDepth(150);

    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.82).setInteractive();
    const panel = this.add.rectangle(400, 300, 550, 460, 0x10131d)
      .setStrokeStyle(2, 0xd9a441);

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


  // ============================================================
  // STAMINA & UI
  // ============================================================
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

  updateUI() {
    this.applyAdminCheats();
    this.uiText.setText(`⚡ Stamina: ${PLAYER_DATA.stamina}/${PLAYER_DATA.maxStamina}   |   💰 Or: ${PLAYER_DATA.gold}`);

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