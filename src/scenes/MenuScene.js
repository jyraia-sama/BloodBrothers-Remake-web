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


  // ============================================================
  // PRELOAD
  // ============================================================

  preload() {
    // Aucun asset nécessaire pour le moment
  }


  // ============================================================
  // CREATE
  // ============================================================

  create() {

    if (!PLAYER_DATA.hasChosenHero) {
      this.scene.start('HeroSelectScene');
      return;
    }


    // ==========================================================
    // PALETTE
    // ==========================================================

    const COLORS = {

      // Fond
      background: 0x080a10,
      background2: 0x10131d,

      // Rouge sang
      blood: 0x9e1b32,
      bloodBright: 0xe52b45,

      // Bleu acier
      steel: 0x243b55,
      steelBright: 0x4f81a8,

      // Violet
      purple: 0x45236b,
      purpleBright: 0x9b5de5,

      // Bronze
      bronze: 0x6b4423,
      bronzeBright: 0xc78b3c,

      // Or
      gold: 0xd9a441,
      goldBright: 0xffd86b,

      // Rouge danger
      danger: 0x711c28,
      dangerBright: 0xe33b4f,

      // Texte
      white: 0xffffff,
      grey: 0x9da3b0,
      darkGrey: 0x3a3f4b
    };


    // ==========================================================
    // FOND
    // ==========================================================

    this.add.rectangle(
      400,
      300,
      800,
      600,
      COLORS.background
    )
      .setDepth(-10);


    // Bandes décoratives du fond

    this.add.rectangle(
      400,
      0,
      800,
      3,
      COLORS.blood
    )
      .setDepth(-9);

    this.add.rectangle(
      400,
      597,
      800,
      3,
      COLORS.blood
    )
      .setDepth(-9);


    // ==========================================================
    // DÉCORATIONS LATÉRALES
    // ==========================================================

    this.add.rectangle(
      25,
      300,
      2,
      500,
      COLORS.blood
    )
      .setAlpha(0.35)
      .setDepth(-8);

    this.add.rectangle(
      775,
      300,
      2,
      500,
      COLORS.blood
    )
      .setAlpha(0.35)
      .setDepth(-8);


    // Petits ornements

    this.add.text(
      45,
      55,
      '✦',
      {
        fontSize: '20px',
        color: '#9e1b32'
      }
    )
      .setOrigin(0.5)
      .setAlpha(0.8);

    this.add.text(
      755,
      55,
      '✦',
      {
        fontSize: '20px',
        color: '#9e1b32'
      }
    )
      .setOrigin(0.5)
      .setAlpha(0.8);


    // ==========================================================
    // TITRE
    // ==========================================================

    this.add.text(
      400,
      72,
      'BLOOD BROTHERS',
      {
        fontSize: '38px',
        color: '#e52b45',
        fontStyle: 'bold',

        stroke: '#320812',
        strokeThickness: 8,

        shadow: {
          offsetX: 0,
          offsetY: 3,
          color: '#000000',
          blur: 8,
          stroke: true,
          fill: true
        }
      }
    )
      .setOrigin(0.5);


    // Ligne sous le titre

    this.add.rectangle(
      400,
      108,
      260,
      2,
      COLORS.blood
    )
      .setOrigin(0.5)
      .setAlpha(0.8);


    this.add.text(
      400,
      128,
      'REMADE WEB',
      {
        fontSize: '14px',
        color: '#9da3b0',
        fontStyle: 'bold',
        letterSpacing: 3
      }
    )
      .setOrigin(0.5);


    // ==========================================================
    // PANNEAU DES STATS
    // ==========================================================

    this.add.rectangle(
      400,
      176,
      360,
      48,
      COLORS.background2
    )
      .setStrokeStyle(
        1,
        COLORS.darkGrey
      );


    // Petite ligne décorative

    this.add.rectangle(
      220,
      176,
      3,
      30,
      COLORS.gold
    );


    this.add.rectangle(
      580,
      176,
      3,
      30,
      COLORS.gold
    );


    // ==========================================================
    // STATS DYNAMIQUES
    // ==========================================================

    this.uiText = this.add.text(
      400,
      168,
      '',
      {
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5);


    this.timerText = this.add.text(
      400,
      190,
      '',
      {
        fontSize: '10px',
        color: '#d9a441'
      }
    )
      .setOrigin(0.5);


    // ==========================================================
    // BOUTONS
    // ==========================================================

    this.createMenuButton(
      400,
      250,
      '🗺️',
      'AVENTURE',
      'Chapitres',
      COLORS.blood,
      COLORS.bloodBright,
      () => {
        this.scene.start('ChapterSelectScene');
      }
    );


    this.createMenuButton(
      400,
      315,
      '🛡️',
      'GESTION DU DECK',
      'Gérer vos cartes',
      COLORS.steel,
      COLORS.steelBright,
      () => {
        this.scene.start('DeckScene');
      }
    );


    this.createMenuButton(
      400,
      380,
      '🔮',
      'INVOCATIONS',
      'Pacte mystique',
      COLORS.purple,
      COLORS.purpleBright,
      () => {
        this.scene.start('GachaScene');
      }
    );


    this.createMenuButton(
      400,
      445,
      '🔥',
      'AUTEL DE FUSION',
      'Fusionner vos cartes',
      COLORS.bronze,
      COLORS.bronzeBright,
      () => {
        this.scene.start('FusionScene');
      }
    );


    this.createMenuButton(
      400,
      510,
      '⚠️',
      'EFFACER LA PARTIE',
      'Réinitialiser votre progression',
      COLORS.danger,
      COLORS.dangerBright,
      () => {

        resetGameData();

        this.scene.start('HeroSelectScene');
      }
    );


    // ==========================================================
    // BOUTON MISES À JOUR
    // ==========================================================

    this.createUpdateButton(
      700,
      35,
      () => {
        this.showChangelogModal();
      }
    );


    // ==========================================================
    // TIMER STAMINA
    // ==========================================================

    this.time.addEvent({
      delay: 1000,

      callback: () => {
        this.updateStaminaTimer();
      },

      loop: true
    });


    // Première mise à jour
    this.updateUI();
  }


  // ============================================================
  // CRÉATION DES BOUTONS DU MENU
  // ============================================================

  createMenuButton(
    x,
    y,
    icon,
    title,
    subtitle,
    normalColor,
    hoverColor,
    callback
  ) {

    // ----------------------------------------------------------
    // Conteneur visuel
    // ----------------------------------------------------------

    const container = this.add.container(
      x,
      y
    );


    // ----------------------------------------------------------
    // Ombre
    // ----------------------------------------------------------

    const shadow = this.add.rectangle(
      0,
      4,
      350,
      50,
      0x000000,
      0.7
    );


    // ----------------------------------------------------------
    // Fond
    // ----------------------------------------------------------

    const background = this.add.rectangle(
      0,
      0,
      350,
      50,
      normalColor,
      0.85
    )
      .setStrokeStyle(
        1,
        normalColor
      );


    // ----------------------------------------------------------
    // Partie sombre intérieure
    // ----------------------------------------------------------

    const inner = this.add.rectangle(
      0,
      0,
      342,
      42,
      0x0d1018,
      0.92
    );


    // ----------------------------------------------------------
    // Barre colorée gauche
    // ----------------------------------------------------------

    const sideBar = this.add.rectangle(
      -171,
      0,
      5,
      42,
      normalColor
    );


    // ----------------------------------------------------------
    // Icône
    // ----------------------------------------------------------

    const iconText = this.add.text(
      -140,
      0,
      icon,
      {
        fontSize: '22px'
      }
    )
      .setOrigin(0.5);


    // ----------------------------------------------------------
    // TITRE
    // ----------------------------------------------------------

    const titleText = this.add.text(
      -105,
      -7,
      title,
      {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0, 0.5);


    // ----------------------------------------------------------
    // SOUS-TITRE
    // ----------------------------------------------------------

    const subtitleText = this.add.text(
      -105,
      11,
      subtitle,
      {
        fontSize: '9px',
        color: '#8d94a3'
      }
    )
      .setOrigin(0, 0.5);


    // ----------------------------------------------------------
    // Petite flèche
    // ----------------------------------------------------------

    const arrow = this.add.text(
      155,
      0,
      '›',
      {
        fontSize: '25px',
        color: '#6f7582'
      }
    )
      .setOrigin(0.5);


    // ----------------------------------------------------------
    // Ajout
    // ----------------------------------------------------------

    container.add([
      shadow,
      background,
      inner,
      sideBar,
      iconText,
      titleText,
      subtitleText,
      arrow
    ]);


    // ----------------------------------------------------------
    // Zone interactive
    // ----------------------------------------------------------

    const hitArea = this.add.rectangle(
      x,
      y,
      350,
      50,
      0xffffff,
      0
    )
      .setInteractive({
        useHandCursor: true
      });


    // ----------------------------------------------------------
    // SURVOL
    // ----------------------------------------------------------

    hitArea.on(
      'pointerover',
      () => {

        background
          .setFillStyle(
            hoverColor,
            0.9
          );

        background.setStrokeStyle(
          2,
          hoverColor
        );

        sideBar.setFillStyle(
          hoverColor
        );

        arrow.setColor(
          '#' + hoverColor.toString(16).padStart(6, '0')
        );


        this.tweens.add({
          targets: container,
          scaleX: 1.025,
          scaleY: 1.025,
          duration: 100,
          ease: 'Power2'
        });
      }
    );


    // ----------------------------------------------------------
    // SORTIE DE SURVOL
    // ----------------------------------------------------------

    hitArea.on(
      'pointerout',
      () => {

        background
          .setFillStyle(
            normalColor,
            0.85
          );

        background.setStrokeStyle(
          1,
          normalColor
        );

        sideBar.setFillStyle(
          normalColor
        );

        arrow.setColor('#6f7582');


        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
          ease: 'Power2'
        });
      }
    );


    // ----------------------------------------------------------
    // CLIC
    // ----------------------------------------------------------

    hitArea.on(
      'pointerdown',
      () => {

        // Petit effet de clic

        this.tweens.add({
          targets: container,
          scaleX: 0.97,
          scaleY: 0.97,
          duration: 60,
          yoyo: true,
          ease: 'Power2'
        });


        callback();
      }
    );
  }


  // ============================================================
  // BOUTON MISES À JOUR
  // ============================================================

  createUpdateButton(
    x,
    y,
    callback
  ) {

    const background = this.add.rectangle(
      x,
      y,
      140,
      32,
      0x171b26,
      0.95
    )
      .setStrokeStyle(
        1,
        0x6b5a2d
      )
      .setInteractive({
        useHandCursor: true
      });


    const icon = this.add.text(
      x - 52,
      y,
      '📜',
      {
        fontSize: '13px'
      }
    )
      .setOrigin(0.5);


    const text = this.add.text(
      x + 8,
      y,
      'MISES À JOUR',
      {
        fontSize: '10px',
        color: '#d9a441',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5);


    background.on(
      'pointerover',
      () => {

        background.setFillStyle(
          0x292315,
          1
        );

        background.setStrokeStyle(
          1,
          0xffd86b
        );

        text.setColor(
          '#ffdf82'
        );
      }
    );


    background.on(
      'pointerout',
      () => {

        background.setFillStyle(
          0x171b26,
          0.95
        );

        background.setStrokeStyle(
          1,
          0x6b5a2d
        );

        text.setColor(
          '#d9a441'
        );
      }
    );


    background.on(
      'pointerdown',
      callback
    );
  }


  // ============================================================
  // FENÊTRE CHANGELOG
  // ============================================================

  showChangelogModal() {

    if (this.modalContainer) {
      this.modalContainer.destroy();
    }


    this.modalContainer =
      this.add.container(0, 0);


    this.modalContainer.setDepth(100);


    // ----------------------------------------------------------
    // OVERLAY
    // ----------------------------------------------------------

    const overlay = this.add.rectangle(
      400,
      300,
      800,
      600,
      0x000000,
      0.82
    )
      .setInteractive();


    // ----------------------------------------------------------
    // PANNEAU
    // ----------------------------------------------------------

    const panel = this.add.rectangle(
      400,
      300,
      550,
      460,
      0x10131d
    )
      .setStrokeStyle(
        2,
        0xd9a441
      );


    // ----------------------------------------------------------
    // BARRE TITRE
    // ----------------------------------------------------------

    this.add.rectangle(
      400,
      92,
      480,
      2,
      0x9e1b32
    );


    const title = this.add.text(
      400,
      70,
      'NOTES DE MISE À JOUR',
      {
        fontSize: '20px',
        color: '#ffd86b',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5);


    // ----------------------------------------------------------
    // CONTENU
    // ----------------------------------------------------------

    let changelogTextContent = "";


    CHANGELOG_DATA.forEach(
      (entry, i) => {

        changelogTextContent +=
          `📅 ${entry.date}\n`;

        entry.points.forEach(
          point => {

            changelogTextContent +=
              ` • ${point}\n`;
          }
        );


        if (
          i <
          CHANGELOG_DATA.length - 1
        ) {

          changelogTextContent +=
            "\n";
        }
      }
    );


    const contentText = this.add.text(
      160,
      115,
      changelogTextContent,
      {
        fontSize: '12px',
        color: '#cccccc',
        lineSpacing: 4,

        wordWrap: {
          width: 480
        }
      }
    );


    // ----------------------------------------------------------
    // BOUTON RETOUR
    // ----------------------------------------------------------

    const closeBtn = this.add.rectangle(
      400,
      490,
      170,
      38,
      0x252a38
    )
      .setInteractive({
        useHandCursor: true
      })
      .setStrokeStyle(
        1,
        0x9da3b0
      );


    const closeText = this.add.text(
      400,
      490,
      '‹  RETOUR AU MENU',
      {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5);


    // ----------------------------------------------------------
    // SURVOL RETOUR
    // ----------------------------------------------------------

    closeBtn.on(
      'pointerover',
      () => {

        closeBtn.setFillStyle(
          0x3a4052
        );

        closeBtn.setStrokeStyle(
          1,
          0xffffff
        );
      }
    );


    closeBtn.on(
      'pointerout',
      () => {

        closeBtn.setFillStyle(
          0x252a38
        );

        closeBtn.setStrokeStyle(
          1,
          0x9da3b0
        );
      }
    );


    // ----------------------------------------------------------
    // FERMETURE
    // ----------------------------------------------------------

    const closeModal = () => {

      if (this.modalContainer) {

        this.modalContainer.destroy();

        this.modalContainer = null;
      }
    };


    closeBtn.on(
      'pointerdown',
      closeModal
    );


    overlay.on(
      'pointerdown',
      closeModal
    );


    // ----------------------------------------------------------
    // AJOUT AU CONTENEUR
    // ----------------------------------------------------------

    this.modalContainer.add([
      overlay,
      panel,
      title,
      contentText,
      closeBtn,
      closeText
    ]);
  }


  // ============================================================
  // STAMINA
  // ============================================================

  updateStaminaTimer() {

    if (
      PLAYER_DATA.stamina <
      PLAYER_DATA.maxStamina
    ) {

      const now = Date.now();

      const elapsed =
        now -
        PLAYER_DATA.lastStaminaUpdate;


      if (
        elapsed >=
        STAMINA_REGEN_INTERVAL
      ) {

        PLAYER_DATA.stamina += 1;

        PLAYER_DATA.lastStaminaUpdate =
          now;


        saveGameData();
      }
    }


    this.updateUI();
  }


  // ============================================================
  // UPDATE UI
  // ============================================================

  updateUI() {

    this.uiText.setText(
      `⚡ Stamina: ${PLAYER_DATA.stamina}/${PLAYER_DATA.maxStamina}   |   💰 Or: ${PLAYER_DATA.gold}`
    );


    if (
      PLAYER_DATA.stamina <
      PLAYER_DATA.maxStamina
    ) {

      const now = Date.now();

      const elapsed =
        now -
        PLAYER_DATA.lastStaminaUpdate;


      const timeLeft =
        Math.max(
          0,
          STAMINA_REGEN_INTERVAL -
          elapsed
        );


      const totalSeconds =
        Math.ceil(
          timeLeft / 1000
        );


      const minutes =
        Math.floor(
          totalSeconds / 60
        );


      const seconds =
        totalSeconds % 60;


      const timeString =
        `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;


      this.timerText.setText(
        `Prochaine stamina dans : ${timeString}`
      );

    } else {

      this.timerText.setText('');
    }
  }
}