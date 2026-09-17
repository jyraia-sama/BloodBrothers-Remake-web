import { PLAYER_DATA, saveGameData, getInstanceById } from '../saveSystem.js';
import { UNITS_DATABASE } from '../database.js';
import { getInstanceStats, getLevelProgress, xpForNextLevel, MAX_LEVEL, getSellPrice, describeSkill } from '../levelSystem.js';
import { makeScrollable } from '../scrollHelper.js';

const INVENTORY_VIEWPORT = { x: 400, y: 425, width: 780, height: 310 };
const COLS = 7;
const ROW_HEIGHT = 118;

export class DeckScene extends Phaser.Scene {
  constructor() { super({ key: 'DeckScene' }); }

  create() {
    this.add.text(400, 35, 'GESTION DU DECK', { fontSize: '26px', color: '#3355aa', fontStyle: 'bold' }).setOrigin(0.5);
    const backBtn = this.add.rectangle(70, 30, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    this.add.text(70, 30, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.goldText = this.add.text(700, 30, `💰 ${PLAYER_DATA.gold}`, { fontSize: '15px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);

    this.infoText = this.add.text(400, 70, 'Cliquez sur une carte pour la transférer | Survolez un sort pour le détailler', { fontSize: '13px', color: '#aaaaaa' }).setOrigin(0.5);

    this.inventoryScroll = null;
    this.tooltip = this.createTooltip();

    this.renderDeck();
    this.renderInventory();
  }

  /** Bulle d'info réutilisable, affichée/masquée au survol d'un texte de sort. */
  createTooltip() {
    const container = this.add.container(0, 0).setDepth(200).setVisible(false);
    const bg = this.add.rectangle(0, 0, 10, 10, 0x0a0a12, 0.95).setStrokeStyle(1, 0xffdd00).setOrigin(0.5);
    const text = this.add.text(0, 0, '', {
      fontSize: '11px', color: '#ffffff', align: 'center', lineSpacing: 3,
      wordWrap: { width: 190 }
    }).setOrigin(0.5);
    container.add([bg, text]);

    return {
      show: (px, py, message) => {
        text.setText(message);
        bg.setSize(text.width + 20, text.height + 14);
        const clampedX = Phaser.Math.Clamp(px, 110, 690);
        const clampedY = Phaser.Math.Clamp(py, 40, 560);
        container.setPosition(clampedX, clampedY);
        container.setVisible(true);
      },
      hide: () => container.setVisible(false)
    };
  }

  /** Attache le survol d'un texte de sort à la bulle d'info partagée. */
  bindSkillTooltip(textObj, skill) {
    if (!skill) return;
    textObj.setInteractive();
    textObj.on('pointerover', (pointer) => this.tooltip.show(pointer.x, pointer.y - 10, describeSkill(skill)));
    textObj.on('pointermove', (pointer) => this.tooltip.show(pointer.x, pointer.y - 10, describeSkill(skill)));
    textObj.on('pointerout', () => this.tooltip.hide());
  }

  /** Dessine une petite barre d'XP sous une carte. */
  drawXpBar(container, x, y, width, instance) {
    const bg = this.add.rectangle(x, y, width, 5, 0x222222).setStrokeStyle(1, 0x555555);
    const progress = getLevelProgress(instance);
    const fillWidth = Math.max(1, width * progress);
    const fill = this.add.rectangle(x - width / 2 + fillWidth / 2, y, fillWidth, 5,
      instance.level >= MAX_LEVEL ? 0xffdd00 : 0x00ccaa);
    container.add([bg, fill]);
  }

  renderDeck() {
    if (this.deckContainer) this.deckContainer.destroy();
    this.deckContainer = this.add.container(0, 0);
    this.deckContainer.add(this.add.text(400, 105, `ÉQUIPE ÉQUIPÉE (${PLAYER_DATA.deck.length}/5)`, { fontSize: '15px', color: '#00ff00', fontStyle: 'bold' }).setOrigin(0.5));

    PLAYER_DATA.deck.forEach((instanceId, index) => {
      const instance = getInstanceById(instanceId);
      if (!instance) return;

      const base = UNITS_DATABASE[instance.unitKey];
      const stats = getInstanceStats(base, instance);
      const x = 150 + index * 125, y = 178;

      const card = this.add.rectangle(x, y, 92, 112, base.color).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
      const nameText = this.add.text(x, y - 39, base.name.split(' ')[0], { fontSize: '11px', color: '#fff' }).setOrigin(0.5);
      const lvlText = this.add.text(x, y - 24, `Nv. ${instance.level}`, { fontSize: '11px', color: '#00ffaa', fontStyle: 'bold' }).setOrigin(0.5);

      const atkText = this.add.text(x, y - 8, `ATK:${stats.atk}`, { fontSize: '10px', color: '#ffdd00' }).setOrigin(0.5);
      const wisText = this.add.text(x, y + 6, `WIS:${stats.wis}`, { fontSize: '10px', color: '#00ffff' }).setOrigin(0.5);

      const infoBtn = this.add.circle(x + 33, y - 43, 11, 0x111111).setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true });
      const infoLabel = this.add.text(x + 33, y - 43, '?', { fontSize: '11px', color: '#fff' }).setOrigin(0.5);

      infoBtn.on('pointerdown', (pointer) => {
        pointer.event.stopPropagation();
        this.showUnitDetails(instance);
      });

      card.on('pointerdown', () => {
        PLAYER_DATA.deck.splice(index, 1);
        saveGameData();
        this.renderDeck();
        this.renderInventory();
      });

      this.deckContainer.add([card, nameText, lvlText, atkText, wisText, infoBtn, infoLabel]);
      this.drawXpBar(this.deckContainer, x, y + 36, 76, instance);
    });
  }

  renderInventory() {
    // Nettoyage de l'ancien défilement avant reconstruction (évite les doublons d'écouteurs)
    if (this.inventoryScroll) {
      this.inventoryScroll.destroy();
      this.inventoryScroll = null;
    }
    if (this.inventoryHeader) this.inventoryHeader.destroy();
    if (this.inventoryContainer) this.inventoryContainer.destroy();

    this.inventoryHeader = this.add.text(400, 250, 'RÉSERVE / INVENTAIRE', { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.inventoryContainer = this.add.container(0, 0);

    const viewportTop = INVENTORY_VIEWPORT.y - INVENTORY_VIEWPORT.height / 2; // 270
    const firstRowY = viewportTop + 65; // 335

    PLAYER_DATA.inventory.forEach((instance, index) => {
      const base = UNITS_DATABASE[instance.unitKey];
      if (!base) return;

      const x = 100 + (index % COLS) * 100;
      const y = firstRowY + Math.floor(index / COLS) * ROW_HEIGHT;

      const isEquipped = PLAYER_DATA.deck.includes(instance.instanceId);

      const cardColor = isEquipped ? 0x444444 : base.color;
      const strokeColor = isEquipped ? 0x666666 : 0xaaaaaa;

      const card = this.add.rectangle(x, y, 82, 110, cardColor).setStrokeStyle(1, strokeColor).setInteractive({ useHandCursor: true });
      const nameText = this.add.text(x, y - 38, base.name.split(' ')[0], { fontSize: '10px', color: isEquipped ? '#888888' : '#fff' }).setOrigin(0.5);
      const lvlText = this.add.text(x, y - 23, `Nv. ${instance.level}`, { fontSize: '10px', color: isEquipped ? '#888888' : '#00ffaa' }).setOrigin(0.5);
      const rarityText = this.add.text(x, y - 8, `[${base.rarity}]`, { fontSize: '11px', color: isEquipped ? '#888888' : '#ffdd00' }).setOrigin(0.5);

      const infoBtn = this.add.circle(x + 29, y - 42, 10, 0x111111).setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true });
      const infoLabel = this.add.text(x + 29, y - 42, '?', { fontSize: '10px', color: '#fff' }).setOrigin(0.5);

      infoBtn.on('pointerdown', (pointer) => {
        pointer.event.stopPropagation();
        this.showUnitDetails(instance);
      });

      card.on('pointerdown', () => {
        if (isEquipped) {
          this.infoText.setText('Cette carte est déjà dans votre équipe !').setColor('#ff4444');
          return;
        }

        if (PLAYER_DATA.deck.length < 5) {
          PLAYER_DATA.deck.push(instance.instanceId);
          saveGameData();
          this.renderDeck();
          this.renderInventory();
          this.infoText.setText('Cliquez sur une carte pour la transférer | Survolez un sort pour le détailler').setColor('#aaaaaa');
        } else {
          this.infoText.setText('Deck plein (5/5) ! Retirez une carte d\'abord.').setColor('#ff4444');
        }
      });

      this.inventoryContainer.add([card, nameText, lvlText, rarityText, infoBtn, infoLabel]);
      this.drawXpBar(this.inventoryContainer, x, y + 24, 66, instance);

      // --- Vente (uniquement pour une carte NON équipée) ---
      if (!isEquipped) {
        const price = getSellPrice(base);
        const sellBtn = this.add.rectangle(x, y + 41, 76, 17, 0x552222).setStrokeStyle(1, 0xaa4444).setInteractive({ useHandCursor: true });
        const sellLabel = this.add.text(x, y + 41, `💰 Vendre (${price})`, { fontSize: '8px', color: '#ffcccc', fontStyle: 'bold' }).setOrigin(0.5);

        sellBtn.on('pointerover', () => sellBtn.setFillStyle(0x772a2a));
        sellBtn.on('pointerout', () => sellBtn.setFillStyle(0x552222));
        sellBtn.on('pointerdown', (pointer) => {
          pointer.event.stopPropagation();
          this.sellInstance(instance);
        });

        this.inventoryContainer.add([sellBtn, sellLabel]);
      }
    });

    // --- Défilement si le contenu dépasse la zone visible ---
    const rows = Math.max(1, Math.ceil(PLAYER_DATA.inventory.length / COLS));
    const contentHeight = rows * ROW_HEIGHT + 20;
    this.inventoryScroll = makeScrollable(this, this.inventoryContainer, INVENTORY_VIEWPORT, contentHeight);
  }

  /** Vend définitivement une carte non équipée contre de l'or. */
  sellInstance(instance) {
    if (PLAYER_DATA.deck.includes(instance.instanceId)) return; // sécurité : jamais une carte équipée

    const base = UNITS_DATABASE[instance.unitKey];
    const price = getSellPrice(base);

    const idx = PLAYER_DATA.inventory.findIndex(i => i.instanceId === instance.instanceId);
    if (idx === -1) return;

    PLAYER_DATA.inventory.splice(idx, 1);
    PLAYER_DATA.gold += price;
    saveGameData();

    this.tooltip.hide();
    this.goldText.setText(`💰 ${PLAYER_DATA.gold}`);
    this.infoText.setText(`${base.name} vendu pour ${price} Or.`).setColor('#ffdd00');

    this.renderInventory();
  }

  showUnitDetails(instance) {
    if (this.modalContainer) this.modalContainer.destroy();

    const base = UNITS_DATABASE[instance.unitKey];
    const stats = getInstanceStats(base, instance);

    this.modalContainer = this.add.container(0, 0);
    this.modalContainer.setDepth(150);

    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7).setInteractive();
    const panel = this.add.rectangle(400, 300, 380, 430, 0x222233).setStrokeStyle(2, 0xffffff);

    const title = this.add.text(400, 115, `${base.name} [${base.rarity}]`, { fontSize: '20px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);

    const xpStr = instance.level >= MAX_LEVEL
      ? 'NIVEAU MAXIMUM ATTEINT'
      : `XP : ${instance.xp} / ${xpForNextLevel(instance.level)}`;
    const levelLine = this.add.text(400, 145, `Niveau ${instance.level} / ${MAX_LEVEL}  —  ${xpStr}`, { fontSize: '13px', color: '#00ffaa' }).setOrigin(0.5);

    const barBg = this.add.rectangle(400, 168, 260, 10, 0x111111).setStrokeStyle(1, 0x555555);
    const progress = getLevelProgress(instance);
    const fillW = Math.max(1, 260 * progress);
    const barFill = this.add.rectangle(400 - 130 + fillW / 2, 168, fillW, 10,
      instance.level >= MAX_LEVEL ? 0xffdd00 : 0x00ccaa);

    const statsStr = `❤️ HP : ${stats.maxHp}\n⚔️ ATK : ${stats.atk}\n🔮 WIS : ${stats.wis}\n🛡️ DEF : ${stats.def}\n💨 AGI : ${stats.agi}`;
    const statsText = this.add.text(265, 195, statsStr, { fontSize: '15px', color: '#ffffff', lineSpacing: 6 });

    const fusionStr = instance.fusionCount > 0
      ? `✨ Fusions absorbées : ${instance.fusionCount} (+${Math.round((Math.pow(1.15, instance.fusionCount) - 1) * 100)}% ATK/PV)`
      : '✨ Aucune fusion absorbée';
    const fusionText = this.add.text(400, 325, fusionStr, { fontSize: '12px', color: '#ff9944' }).setOrigin(0.5);

    const skillTitle = this.add.text(400, 355, `Compétence : ${base.skill ? base.skill.name : 'Aucune'}`, { fontSize: '15px', color: '#00ffff', fontStyle: 'bold' }).setOrigin(0.5);
    const skillDesc = this.add.text(400, 380, `Chances de déclenchement : ${base.skill ? (base.skill.chance * 100) + '%' : 'N/A'}`, { fontSize: '13px', color: '#cccccc' }).setOrigin(0.5);
    this.bindSkillTooltip(skillTitle, base.skill);

    const closeBtn = this.add.rectangle(400, 460, 140, 35, 0xaa2222).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff);
    const closeText = this.add.text(400, 460, 'Fermer', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    closeBtn.on('pointerdown', () => this.modalContainer.destroy());
    overlay.on('pointerdown', () => this.modalContainer.destroy());

    this.modalContainer.add([overlay, panel, title, levelLine, barBg, barFill, statsText, fusionText, skillTitle, skillDesc, closeBtn, closeText]);
  }
}