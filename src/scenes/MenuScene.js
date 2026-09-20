import {
  PLAYER_DATA,
  STAMINA_REGEN_INTERVAL,
  saveGameData,
  resetGameData,
  exportSaveData,
  importSaveData
} from '../saveSystem.js';

import { CHANGELOG_DATA } from './ChangelogData.js';
import { GUIDE_SECTIONS } from '../GuideData.js';
import { getAccountProgress, accountXpForNextLevel, MAX_ACCOUNT_LEVEL } from '../levelSystem.js';
import { makeScrollable } from '../scrollHelper.js';
import { ITEM_KEYS, getSetEssenceKey } from '../ItemData.js';
import { ECHO_SET_KEYS } from '../EchoData.js';
import { FRAGMENT_ELIGIBLE_KEYS } from '../database.js';

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
      crimson: 0x8a1a4a,
      crimsonBright: 0xd6428f,
      background2: 0x10131d,
      darkGrey: 0x3a3f4b,
      gold: 0xd9a441
    };

    // Fond
    this.add.image(400, 300, 'menuBg')
      .setDisplaySize(800, 600)
      .setDepth(-10);

    // Titre
    this.add.text(400, 50, 'BROTHERS OF LEGACY', {
      fontSize: '30px',
      color: '#e52b45',
      fontStyle: 'bold',
      stroke: '#320812',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 8, stroke: true, fill: true }
    }).setOrigin(0.5);

    this.add.rectangle(400, 78, 220, 2, COLORS.blood).setOrigin(0.5).setAlpha(0.8);

    this.add.text(400, 93, 'TEARS AND BLOOD', {
      fontSize: '12px',
      color: '#e52b45',
      fontStyle: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5);

    // Panneau des stats
    this.add.rectangle(400, 121, 420, 40, COLORS.background2, 0.85)
      .setStrokeStyle(1, COLORS.darkGrey);

    this.add.rectangle(205, 121, 3, 26, COLORS.gold);
    this.add.rectangle(595, 121, 3, 26, COLORS.gold);

    this.uiText = this.add.text(400, 114, '', {
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.timerText = this.add.text(400, 133, '', {
      fontSize: '10px',
      color: '#d9a441'
    }).setOrigin(0.5);

    // --- Niveau de compte + barre de progression ---
    this.accountText = this.add.text(400, 150, '', {
      fontSize: '11px',
      color: '#7fd4ff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.accountBarBg = this.add.rectangle(400, 163, 240, 6, 0x0d1018, 0.9)
      .setStrokeStyle(1, COLORS.darkGrey);
    this.accountBarFill = this.add.rectangle(280, 163, 1, 6, 0x4f9fd8).setOrigin(0, 0.5);

    // Boutons du menu
    this.createMenuButton(400, 200, '🗺️', 'AVENTURE', '7 Actes', COLORS.blood, COLORS.bloodBright, () => {
      this.scene.start('ChapterSelectScene');
    });

    this.createMenuButton(400, 263, '🛡️', 'GESTION DU DECK', 'Gérer vos cartes', COLORS.steel, COLORS.steelBright, () => {
      this.scene.start('DeckScene');
    });

    this.createMenuButton(400, 326, '🔮', 'INVOCATIONS', 'Pacte mystique', COLORS.purple, COLORS.purpleBright, () => {
      this.scene.start('GachaScene');
    });

    this.createMenuButton(400, 389, '🔥', 'AUTEL DE FUSION', 'Fusionner vos cartes', COLORS.bronze, COLORS.bronzeBright, () => {
      this.scene.start('FusionScene');
    });

    this.createMenuButton(400, 452, '🩸', 'ÉCHOS SANGUINS', 'Équiper vos Échos', COLORS.crimson, COLORS.crimsonBright, () => {
      this.scene.start('EchoScene');
    });

    // Le Reliquaire : même style empilé que les autres boutons
    this.createMenuButton(400, 515, '🏺', 'LE RELIQUAIRE', 'Poussière, Essences, Fragments...', 0x3a2266, 0x5c3aa3, () => {
      this.scene.start('ReliquaryScene');
    });

    // Mises à jour : icône de coin, en bas à droite
    this.createCornerIconButton(755, 570, '📜', () => {
      this.showChangelogModal();
    });

    this.createAdminButton(765, 30, () => {
      this.showAdminModal();
    });

    this.createHelpButton(35, 30, () => {
      this.showGuideModal();
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
    if (typeof PLAYER_DATA.adminStaminaActive === 'undefined') PLAYER_DATA.adminStaminaActive = false;
    if (typeof PLAYER_DATA.adminBuffActive === 'undefined') PLAYER_DATA.adminBuffActive = false;
    if (typeof PLAYER_DATA.adminItemsActive === 'undefined') PLAYER_DATA.adminItemsActive = false;

    if (PLAYER_DATA.adminGoldActive) {
      PLAYER_DATA.gold = Number.MAX_SAFE_INTEGER;
    }
    if (PLAYER_DATA.adminStaminaActive) {
      PLAYER_DATA.stamina = PLAYER_DATA.maxStamina;
    }
    if (PLAYER_DATA.adminItemsActive) {
      this.fillAllItemsToInfinite();
    }
  }

  /** Remet tous les objets du Reliquaire (objets, Essences de Set, Fragments) à une quantité très élevée. */
  fillAllItemsToInfinite() {
    const INFINITE_QTY = 9999;
    ITEM_KEYS.forEach(key => { PLAYER_DATA.items[key] = INFINITE_QTY; });
    ECHO_SET_KEYS.forEach(setKey => { PLAYER_DATA.items[getSetEssenceKey(setKey)] = INFINITE_QTY; });
    FRAGMENT_ELIGIBLE_KEYS.forEach(heroKey => { PLAYER_DATA.heroFragments[heroKey] = INFINITE_QTY; });
  }

  showAdminModal() {
    if (this.modalContainer) {
      this.modalContainer.destroy();
    }

    this.modalContainer = this.add.container(0, 0);
    this.modalContainer.setDepth(150);

    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setInteractive();
    const panel = this.add.rectangle(400, 330, 480, 500, 0x10131d).setStrokeStyle(2, 0xe52b45);

    this.add.rectangle(400, 160, 400, 2, 0x9e1b32);

    const title = this.add.text(400, 135, '⚙️ MODE ADMINISTRATEUR', {
      fontSize: '18px',
      color: '#ffd86b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // --- Or infini ---
    const cbGoldBg = this.add.rectangle(230, 200, 24, 24, 0x252a38).setStrokeStyle(2, 0x9da3b0).setInteractive({ useHandCursor: true });
    const cbGoldCheck = this.add.text(230, 200, '✓', { fontSize: '16px', color: '#ffd86b', fontStyle: 'bold' }).setOrigin(0.5);
    cbGoldCheck.setVisible(!!PLAYER_DATA.adminGoldActive);

    const lblGold = this.add.text(260, 200, 'Activer l\'or infini', { fontSize: '13px', color: '#ffffff' }).setOrigin(0, 0.5);

    const toggleGold = () => {
      PLAYER_DATA.adminGoldActive = !PLAYER_DATA.adminGoldActive;
      cbGoldCheck.setVisible(PLAYER_DATA.adminGoldActive);

      if (PLAYER_DATA.adminGoldActive) {
        // Sauvegarde la valeur avant triche, pour pouvoir la restaurer
        PLAYER_DATA.goldBeforeAdminCheat = PLAYER_DATA.gold;
      } else if (PLAYER_DATA.goldBeforeAdminCheat !== undefined) {
        PLAYER_DATA.gold = PLAYER_DATA.goldBeforeAdminCheat;
        delete PLAYER_DATA.goldBeforeAdminCheat;
      }

      this.applyAdminCheats();
      saveGameData();
      this.updateUI();
    };
    cbGoldBg.on('pointerdown', toggleGold);
    lblGold.setInteractive({ useHandCursor: true }).on('pointerdown', toggleGold);

    // --- Stamina infinie ---
    const cbStaminaBg = this.add.rectangle(230, 245, 24, 24, 0x252a38).setStrokeStyle(2, 0x9da3b0).setInteractive({ useHandCursor: true });
    const cbStaminaCheck = this.add.text(230, 245, '✓', { fontSize: '16px', color: '#ffd86b', fontStyle: 'bold' }).setOrigin(0.5);
    cbStaminaCheck.setVisible(!!PLAYER_DATA.adminStaminaActive);

    const lblStamina = this.add.text(260, 245, 'Activer la stamina infinie', { fontSize: '13px', color: '#ffffff' }).setOrigin(0, 0.5);

    const toggleStamina = () => {
      PLAYER_DATA.adminStaminaActive = !PLAYER_DATA.adminStaminaActive;
      cbStaminaCheck.setVisible(PLAYER_DATA.adminStaminaActive);

      if (PLAYER_DATA.adminStaminaActive) {
        // Sauvegarde la valeur avant triche, pour pouvoir la restaurer
        PLAYER_DATA.staminaBeforeAdminCheat = PLAYER_DATA.stamina;
      } else if (PLAYER_DATA.staminaBeforeAdminCheat !== undefined) {
        PLAYER_DATA.stamina = Math.min(PLAYER_DATA.maxStamina, PLAYER_DATA.staminaBeforeAdminCheat);
        delete PLAYER_DATA.staminaBeforeAdminCheat;
      }

      this.applyAdminCheats();
      saveGameData();
      this.updateUI();
    };
    cbStaminaBg.on('pointerdown', toggleStamina);
    lblStamina.setInteractive({ useHandCursor: true }).on('pointerdown', toggleStamina);

    // --- Statistiques x2 ---
    const cbBuffBg = this.add.rectangle(230, 290, 24, 24, 0x252a38).setStrokeStyle(2, 0x9da3b0).setInteractive({ useHandCursor: true });
    const cbBuffCheck = this.add.text(230, 290, '✓', { fontSize: '16px', color: '#ffd86b', fontStyle: 'bold' }).setOrigin(0.5);
    cbBuffCheck.setVisible(!!PLAYER_DATA.adminBuffActive);

    const lblBuff = this.add.text(260, 290, 'Statistiques de toutes les cartes x2', { fontSize: '13px', color: '#ffffff' }).setOrigin(0, 0.5);

    const toggleBuff = () => {
      PLAYER_DATA.adminBuffActive = !PLAYER_DATA.adminBuffActive;
      cbBuffCheck.setVisible(PLAYER_DATA.adminBuffActive);
      saveGameData();
    };
    cbBuffBg.on('pointerdown', toggleBuff);
    lblBuff.setInteractive({ useHandCursor: true }).on('pointerdown', toggleBuff);

    // --- Objets infinis (Reliquaire) ---
    const cbItemsBg = this.add.rectangle(230, 335, 24, 24, 0x252a38).setStrokeStyle(2, 0x9da3b0).setInteractive({ useHandCursor: true });
    const cbItemsCheck = this.add.text(230, 335, '✓', { fontSize: '16px', color: '#ffd86b', fontStyle: 'bold' }).setOrigin(0.5);
    cbItemsCheck.setVisible(!!PLAYER_DATA.adminItemsActive);

    const lblItems = this.add.text(260, 335, 'Objets infinis (Reliquaire)', { fontSize: '13px', color: '#ffffff' }).setOrigin(0, 0.5);

    const toggleItems = () => {
      PLAYER_DATA.adminItemsActive = !PLAYER_DATA.adminItemsActive;
      cbItemsCheck.setVisible(PLAYER_DATA.adminItemsActive);

      if (PLAYER_DATA.adminItemsActive) {
        // Sauvegarde l'état avant triche, pour pouvoir le restaurer
        PLAYER_DATA.itemsBeforeAdminCheat = JSON.parse(JSON.stringify(PLAYER_DATA.items));
        PLAYER_DATA.heroFragmentsBeforeAdminCheat = JSON.parse(JSON.stringify(PLAYER_DATA.heroFragments));
      } else {
        if (PLAYER_DATA.itemsBeforeAdminCheat !== undefined) {
          PLAYER_DATA.items = PLAYER_DATA.itemsBeforeAdminCheat;
          delete PLAYER_DATA.itemsBeforeAdminCheat;
        }
        if (PLAYER_DATA.heroFragmentsBeforeAdminCheat !== undefined) {
          PLAYER_DATA.heroFragments = PLAYER_DATA.heroFragmentsBeforeAdminCheat;
          delete PLAYER_DATA.heroFragmentsBeforeAdminCheat;
        }
      }

      this.applyAdminCheats();
      saveGameData();
      this.updateUI();
    };
    cbItemsBg.on('pointerdown', toggleItems);
    lblItems.setInteractive({ useHandCursor: true }).on('pointerdown', toggleItems);

    // --- Effacer la partie (déplacé ici depuis le menu principal) ---
    const resetBtn = this.add.rectangle(400, 385, 320, 36, 0x711c28).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xe33b4f);
    const resetText = this.add.text(400, 385, '⚠️ EFFACER LA PARTIE', { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    resetBtn.on('pointerover', () => resetBtn.setFillStyle(0xe33b4f));
    resetBtn.on('pointerout', () => resetBtn.setFillStyle(0x711c28));
    resetBtn.on('pointerdown', () => {
      resetGameData();
      this.scene.start('HeroSelectScene');
    });

    // --- Export / Import de sauvegarde ---
    const ioResultText = this.add.text(400, 497, '', { fontSize: '11px', color: '#88ff88', align: 'center', wordWrap: { width: 420 } }).setOrigin(0.5);

    const exportBtn = this.add.rectangle(400, 425, 320, 34, 0x1a3a5a).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x4f81a8);
    const exportText = this.add.text(400, 425, '📤 Exporter la sauvegarde', { fontSize: '12px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    exportBtn.on('pointerover', () => exportBtn.setFillStyle(0x2a5a8a));
    exportBtn.on('pointerout', () => exportBtn.setFillStyle(0x1a3a5a));
    exportBtn.on('pointerdown', () => {
      this.exportSaveFile();
      ioResultText.setText('Sauvegarde téléchargée.').setColor('#88ff88');
    });

    const importBtn = this.add.rectangle(400, 463, 320, 34, 0x3a2a1a).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xc78b3c);
    const importText = this.add.text(400, 463, '📥 Importer une sauvegarde', { fontSize: '12px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    importBtn.on('pointerover', () => importBtn.setFillStyle(0x5a3a1a));
    importBtn.on('pointerout', () => importBtn.setFillStyle(0x3a2a1a));
    importBtn.on('pointerdown', () => {
      ioResultText.setText('Sélection du fichier...').setColor('#ffdd66');
      this.importSaveFile((result) => {
        if (result.success) {
          ioResultText.setText('Sauvegarde importée ! Redémarrage...').setColor('#88ff88');
          this.time.delayedCall(900, () => this.scene.start('MenuScene'));
        } else {
          ioResultText.setText(`Échec : ${result.error}`).setColor('#ff4444');
        }
      });
    });

    const closeBtn = this.add.rectangle(400, 535, 140, 35, 0x252a38)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x9da3b0);

    const closeText = this.add.text(400, 535, 'FERMER', {
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
      cbStaminaBg, cbStaminaCheck, lblStamina,
      cbBuffBg, cbBuffCheck, lblBuff,
      cbItemsBg, cbItemsCheck, lblItems,
      resetBtn, resetText,
      exportBtn, exportText, importBtn, importText, ioResultText,
      closeBtn, closeText
    ]);
  }

  /** Télécharge la sauvegarde actuelle en fichier .json. */
  exportSaveFile() {
    const dataStr = exportSaveData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);

    const a = document.createElement('a');
    a.href = url;
    a.download = `brothers-of-legacy-save-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** Ouvre un sélecteur de fichier, lit le .json choisi et l'importe. Appelle onDone({success, error?}). */
  importSaveFile(onDone) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';
    document.body.appendChild(input);

    const cleanup = () => {
      if (input.parentNode) document.body.removeChild(input);
    };

    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) { cleanup(); return; }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = importSaveData(evt.target.result);
        onDone(result);
        cleanup();
      };
      reader.onerror = () => {
        onDone({ success: false, error: 'Impossible de lire le fichier.' });
        cleanup();
      };
      reader.readAsText(file);
    });

    input.click();
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

  /** Bouton d'aide (guide du jeu), symétrique de l'icône Admin. */
  createHelpButton(x, y, callback) {
    const btnBg = this.add.rectangle(x, y, 32, 32, 0x000000, 0.3)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x444455);

    const icon = this.add.text(x, y, '❓', { fontSize: '14px' }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x4f81a8, 0.5);
      btnBg.setStrokeStyle(1, 0x9fd4ff);
    });
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x000000, 0.3);
      btnBg.setStrokeStyle(1, 0x444455);
    });
    btnBg.on('pointerdown', callback);
  }

  /** Icône de coin explicite (Mises à jour) : plus visible qu'un simple bouton discret, avec pastille de notification. */
  createCornerIconButton(x, y, icon, callback) {
    const btnBg = this.add.circle(x, y, 24, 0x2a2210, 0.9)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x8a7a2a);

    const iconText = this.add.text(x, y, icon, { fontSize: '20px' }).setOrigin(0.5);
    const label = this.add.text(x, y + 30, 'MàJ', { fontSize: '9px', color: '#d9a441', fontStyle: 'bold' }).setOrigin(0.5);

    // Petite pastille de notification, comme sur la maquette
    this.add.circle(x + 17, y - 17, 7, 0xe33b4f).setStrokeStyle(1, 0xffffff);
    this.add.text(x + 17, y - 17, '!', { fontSize: '9px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x4a3f1a, 1);
      btnBg.setStrokeStyle(2, 0xffd86b);
    });
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x2a2210, 0.9);
      btnBg.setStrokeStyle(2, 0x8a7a2a);
    });
    btnBg.on('pointerdown', callback);

    return { btnBg, iconText, label };
  }

  createMenuButton(x, y, icon, title, subtitle, normalColor, hoverColor, callback) {
    const container = this.add.container(x, y);

    const shadow = this.add.rectangle(0, 4, 350, 50, 0x000000, 0.7);
    const background = this.add.rectangle(0, 0, 350, 50, normalColor, 0.85).setStrokeStyle(1, normalColor);
    const inner = this.add.rectangle(0, 0, 342, 42, 0x0d1018, 0.92);
    const sideBar = this.add.rectangle(-171, 0, 5, 42, normalColor);
    const iconGlow = this.add.circle(-140, 0, 17, normalColor, 0.35).setStrokeStyle(1, hoverColor, 0.6);
    const iconText = this.add.text(-140, 0, icon, { fontSize: '22px' }).setOrigin(0.5);
    const cornerAccent = this.add.triangle(163, -19, 0, 0, 16, 0, 0, 16, normalColor, 0.6);
    const titleText = this.add.text(-105, -7, title, { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5);
    const subtitleText = this.add.text(-105, 11, subtitle, { fontSize: '9px', color: '#8d94a3' }).setOrigin(0, 0.5);
    const arrow = this.add.text(155, 0, '›', { fontSize: '25px', color: '#6f7582' }).setOrigin(0.5);

    container.add([shadow, background, inner, sideBar, iconGlow, iconText, cornerAccent, titleText, subtitleText, arrow]);

    const hitArea = this.add.rectangle(x, y, 350, 50, 0xffffff, 0).setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      background.setFillStyle(hoverColor, 0.9);
      background.setStrokeStyle(2, hoverColor);
      sideBar.setFillStyle(hoverColor);
      iconGlow.setFillStyle(hoverColor, 0.5);
      cornerAccent.setFillStyle(hoverColor, 0.9);
      arrow.setColor('#' + hoverColor.toString(16).padStart(6, '0'));
      this.tweens.add({ targets: container, scaleX: 1.025, scaleY: 1.025, duration: 100, ease: 'Power2' });
    });

    hitArea.on('pointerout', () => {
      background.setFillStyle(normalColor, 0.85);
      background.setStrokeStyle(1, normalColor);
      sideBar.setFillStyle(normalColor);
      iconGlow.setFillStyle(normalColor, 0.35);
      cornerAccent.setFillStyle(normalColor, 0.6);
      arrow.setColor('#6f7582');
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100, ease: 'Power2' });
    });

    hitArea.on('pointerdown', () => {
      this.tweens.add({ targets: container, scaleX: 0.97, scaleY: 0.97, duration: 60, yoyo: true, ease: 'Power2' });
      callback();
    });
  }

  showChangelogModal() {
    if (this.changelogScroll) {
      this.changelogScroll.destroy();
      this.changelogScroll = null;
    }
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

    // --- Bouton de retour, en haut à droite du panneau ---
    const closeBtn = this.add.circle(652, 82, 17, 0x252a38).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x9da3b0);
    const closeIcon = this.add.text(652, 82, '✕', { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    closeBtn.on('pointerover', () => {
      closeBtn.setFillStyle(0x3a4052);
      closeBtn.setStrokeStyle(1, 0xffffff);
    });
    closeBtn.on('pointerout', () => {
      closeBtn.setFillStyle(0x252a38);
      closeBtn.setStrokeStyle(1, 0x9da3b0);
    });

    // --- Contenu déroulant ---
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

    const scrollContainer = this.add.container(0, 0);
    const contentText = this.add.text(170, 140, changelogTextContent, {
      fontSize: '12px',
      color: '#cccccc',
      lineSpacing: 4,
      wordWrap: { width: 460 }
    });
    scrollContainer.add(contentText);

    const viewport = { x: 400, y: 315, width: 480, height: 370 };
    const contentHeight = contentText.height + 20;
    this.changelogScroll = makeScrollable(this, scrollContainer, viewport, contentHeight);

    const closeModal = () => {
      if (this.changelogScroll) {
        this.changelogScroll.destroy();
        this.changelogScroll = null;
      }
      if (this.modalContainer) {
        this.modalContainer.destroy();
        this.modalContainer = null;
      }
    };

    closeBtn.on('pointerdown', closeModal);
    overlay.on('pointerdown', closeModal);

    this.modalContainer.add([overlay, panel, title, closeBtn, closeIcon, scrollContainer]);
  }

  showGuideModal() {
    if (this.guideScroll) {
      this.guideScroll.destroy();
      this.guideScroll = null;
    }
    if (this.modalContainer) {
      this.modalContainer.destroy();
    }

    this.modalContainer = this.add.container(0, 0);
    this.modalContainer.setDepth(150);

    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setInteractive();
    const panel = this.add.rectangle(400, 300, 580, 500, 0x10131d).setStrokeStyle(2, 0x4f81a8);

    this.add.rectangle(400, 77, 500, 2, 0x2a4a6a);

    const title = this.add.text(400, 55, 'GUIDE DU JEU', {
      fontSize: '20px',
      color: '#9fd4ff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // --- Bouton de fermeture, en haut à droite du panneau ---
    const closeBtn = this.add.circle(667, 67, 17, 0x252a38).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x9da3b0);
    const closeIcon = this.add.text(667, 67, '✕', { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    closeBtn.on('pointerover', () => {
      closeBtn.setFillStyle(0x3a4052);
      closeBtn.setStrokeStyle(1, 0xffffff);
    });
    closeBtn.on('pointerout', () => {
      closeBtn.setFillStyle(0x252a38);
      closeBtn.setStrokeStyle(1, 0x9da3b0);
    });

    // --- Contenu déroulant, section par section ---
    const scrollContainer = this.add.container(0, 0);
    const textObjects = [];
    let cursorY = 105;
    const wrapWidth = 490;

    GUIDE_SECTIONS.forEach((section) => {
      const headerText = this.add.text(155, cursorY, `${section.icon}  ${section.title}`, {
        fontSize: '15px', color: '#9fd4ff', fontStyle: 'bold'
      });
      textObjects.push(headerText);
      cursorY += headerText.height + 6;

      const bodyText = this.add.text(155, cursorY, section.body, {
        fontSize: '12px', color: '#dddddd', lineSpacing: 5, wordWrap: { width: wrapWidth }
      });
      textObjects.push(bodyText);
      cursorY += bodyText.height + 22;
    });

    scrollContainer.add(textObjects);

    const viewport = { x: 400, y: 320, width: 510, height: 400 };
    const contentHeight = cursorY;
    this.guideScroll = makeScrollable(this, scrollContainer, viewport, contentHeight);

    const closeModal = () => {
      if (this.guideScroll) {
        this.guideScroll.destroy();
        this.guideScroll = null;
      }
      if (this.modalContainer) {
        this.modalContainer.destroy();
        this.modalContainer = null;
      }
    };

    closeBtn.on('pointerdown', closeModal);
    overlay.on('pointerdown', closeModal);

    this.modalContainer.add([overlay, panel, title, closeBtn, closeIcon, scrollContainer]);
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
    const goldDisplay = PLAYER_DATA.adminGoldActive ? '∞' : PLAYER_DATA.gold;
    const staminaDisplay = PLAYER_DATA.adminStaminaActive ? '∞' : PLAYER_DATA.stamina;
    this.uiText.setText(`⚡ Stamina: ${staminaDisplay}/${PLAYER_DATA.maxStamina}   |   💰 Or: ${goldDisplay}   |   🌠 ${PLAYER_DATA.summonShards || 0}`);
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