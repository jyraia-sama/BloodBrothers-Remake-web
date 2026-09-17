import { PLAYER_DATA, STAMINA_REGEN_INTERVAL, saveGameData } from '../saveSystem.js';
import { CHAPTERS_DATABASE } from '../database.js';

export class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' });
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.currentChapter = CHAPTERS_DATABASE.find(c => c.id === PLAYER_DATA.currentChapter);
    const mapTiles = this.currentChapter.tiles;

    if (PLAYER_DATA.currentTileId === undefined || PLAYER_DATA.currentTileId === null) {
      PLAYER_DATA.currentTileId = 0;
    }

    this.add.rectangle(400, 300, 800, 600, this.currentChapter.bgColor);
    this.add.text(400, 30, this.currentChapter.title.toUpperCase(), { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Retour', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('ChapterSelectScene'));

    // --- Calcul des positions des cases (support du graphe / embranchements) ---
    const maxCol = Math.max(...mapTiles.map(t => t.col));
    const marginX = 90;
    const spacingX = (800 - marginX * 2) / Math.max(1, maxCol);
    const baseY = 300;
    const rowSpacing = 75;

    mapTiles.forEach(tile => {
      tile.x = marginX + tile.col * spacingX;
      tile.y = baseY + (tile.row || 0) * rowSpacing;
    });

    // --- Tracé des chemins entre les cases ---
    const pathGraphics = this.add.graphics();
    pathGraphics.lineStyle(5, 0x555566, 1);
    mapTiles.forEach(tile => {
      tile.next.forEach(nextId => {
        const target = this.getTile(nextId);
        pathGraphics.beginPath();
        pathGraphics.moveTo(tile.x, tile.y);
        pathGraphics.lineTo(target.x, target.y);
        pathGraphics.strokePath();
      });
    });

    // --- Cases ---
    mapTiles.forEach(tile => {
      this.add.circle(tile.x, tile.y, 26, tile.color).setStrokeStyle(3, 0xffffff);
      this.add.text(tile.x, tile.y + 38, tile.label, { fontSize: '11px', color: '#cccccc' }).setOrigin(0.5);
    });

    const currentTile = this.getTile(PLAYER_DATA.currentTileId);
    this.playerGraphic = this.add.circle(currentTile.x, currentTile.y, 17, 0x00aaff).setStrokeStyle(3, 0xffffff);

    this.add.rectangle(400, 95, 760, 55, 0x222233).setStrokeStyle(1, 0x555577);
    this.uiText = this.add.text(30, 80, '', { fontSize: '15px', color: '#ffffff' });
    this.timerText = this.add.text(30, 105, '', { fontSize: '12px', color: '#ffcc00' });

    this.time.addEvent({
      delay: 1000,
      callback: () => this.updateStaminaTimer(),
      loop: true
    });

    this.updateUI();

    this.logText = this.add.text(400, 470, 'Cliquez sur "Avancer" pour explorer.', { fontSize: '15px', color: '#ffcc00' }).setOrigin(0.5);

    this.actionContainer = this.add.container(0, 0);
    this.renderActionButtons();
  }

  getTile(id) {
    return this.currentChapter.tiles.find(t => t.id === id);
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

  updateUI() {
    const maxCol = Math.max(...this.currentChapter.tiles.map(t => t.col));
    const currentTile = this.getTile(PLAYER_DATA.currentTileId);
    this.uiText.setText(`⚡ Stamina: ${PLAYER_DATA.stamina}/${PLAYER_DATA.maxStamina}   |   💰 Or: ${PLAYER_DATA.gold}   |   📍 Progression: ${currentTile.col}/${maxCol}`);

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

  // Affiche soit le bouton "Avancer" classique, soit un choix de voies si on est sur un embranchement
  renderActionButtons() {
    this.actionContainer.removeAll(true);

    const currentTile = this.getTile(PLAYER_DATA.currentTileId);
    const nextIds = currentTile.next;

    if (nextIds.length === 0) {
      return; // Fin du chemin
    }

    if (nextIds.length === 1) {
      const btnBg = this.add.rectangle(400, 540, 220, 45, 0x338833).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff);
      const btnText = this.add.text(400, 540, 'AVANCER (-1 Stamina)', { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
      btnBg.on('pointerdown', () => this.movePlayer(nextIds[0]));
      this.actionContainer.add([btnBg, btnText]);
    } else {
      const spacing = 260;
      const startX = 400 - ((nextIds.length - 1) * spacing) / 2;

      nextIds.forEach((nextId, index) => {
        const target = this.getTile(nextId);
        const x = startX + index * spacing;

        const btnBg = this.add.rectangle(x, 540, 230, 55, 0x883388).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff);
        const btnLabel = this.add.text(x, 528, `Voie ${index + 1} (-1 Stamina)`, { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        const btnDesc = this.add.text(x, 548, target.label, { fontSize: '13px', color: '#ffdd00' }).setOrigin(0.5);

        btnBg.on('pointerdown', () => this.movePlayer(nextId));
        this.actionContainer.add([btnBg, btnLabel, btnDesc]);
      });

      this.logText.setText('Embranchement ! Choisissez votre voie.').setColor('#ff88ff');
    }
  }

  movePlayer(targetId) {
    if (PLAYER_DATA.stamina <= 0) {
      this.logText.setText('Plus assez de Stamina ! Reviens plus tard.').setColor('#ff4444');
      return;
    }

    const targetTile = this.getTile(targetId);

    PLAYER_DATA.stamina -= 1;
    PLAYER_DATA.currentTileId = targetId;
    saveGameData();
    this.updateUI();

    this.tweens.add({
      targets: this.playerGraphic,
      x: targetTile.x,
      y: targetTile.y - 10,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        this.playerGraphic.setPosition(targetTile.x, targetTile.y);
        this.handleTileEvent(targetTile);
      }
    });
  }

  handleTileEvent(tile) {
    if (tile.type === 'gold') {
      const gainedGold = Math.floor(Math.random() * 50) + 30;
      PLAYER_DATA.gold += gainedGold;
      saveGameData();
      this.logText.setText(`Trésor trouvé ! +${gainedGold} Or.`).setColor('#ffdd00');
      this.updateUI();
      this.renderActionButtons();
    } else if (tile.type === 'heal') {
      PLAYER_DATA.stamina = Math.min(PLAYER_DATA.maxStamina, PLAYER_DATA.stamina + 3);
      saveGameData();
      this.logText.setText('Fontaine miraculeuse ! +3 Stamina.').setColor('#44ff44');
      this.updateUI();
      this.renderActionButtons();
    } else if (tile.type === 'battle' || tile.type === 'boss') {
      if (PLAYER_DATA.deck.length === 0) {
        this.logText.setText('⚠️ Deck vide ! Équipez des unités avant de combattre.').setColor('#ff4444');
        this.renderActionButtons();
        return;
      }
      this.logText.setText('Combat enclenché !').setColor('#ff4444');
      this.actionContainer.removeAll(true);
      this.time.delayedCall(800, () => {
        this.scene.start('BattleScene', { isBoss: tile.type === 'boss', chapter: this.currentChapter });
      });
    } else {
      this.logText.setText('Voie libre.').setColor('#ffffff');
      this.renderActionButtons();
    }
  }
}