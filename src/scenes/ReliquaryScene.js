import { PLAYER_DATA, saveGameData, getItemCount, spendItem, addItem, getHeroFragments, spendHeroFragments } from '../saveSystem.js';
import { UNITS_DATABASE, FRAGMENT_ELIGIBLE_KEYS } from '../database.js';
import { ECHO_SETS, ECHO_SET_KEYS, ECHO_SLOTS } from '../EchoData.js';
import { createEcho } from '../echoSystem.js';
import {
  ITEMS, getSetEssenceKey, getSetKeyFromEssence, isSetEssenceKey,
  FRAGMENTS_REQUIRED, CHEST_KEYS_REQUIRED, ATELIER_DUST_COST, ESSENCE_EXCHANGE_COST
} from '../ItemData.js';
import { createUnitInstance } from '../levelSystem.js';
import { makeScrollable } from '../scrollHelper.js';

const FRAGMENT_VIEWPORT = { x: 400, y: 340, width: 720, height: 420 };
const FRAGMENT_COLS = 3;
const FRAGMENT_ROW_HEIGHT = 130;

export class ReliquaryScene extends Phaser.Scene {
  constructor() { super({ key: 'ReliquaryScene' }); }

  create() {
    this.scrollHandle = null;
    this.drawHub();
  }

  clearScene() {
    if (this.scrollHandle) { this.scrollHandle.destroy(); this.scrollHandle = null; }
    this.children.removeAll(true); // true = detruit reellement les objets (sinon leurs zones cliquables restent actives)
  }

  header(title, backLabel, onBack) {
    this.add.rectangle(400, 300, 800, 600, 0x140f1f);
    this.add.text(400, 25, title, { fontSize: '22px', color: '#e0b0ff', fontStyle: 'bold' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 25, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff).setDepth(50);
    this.add.text(70, 25, backLabel, { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5).setDepth(51);
    backBtn.on('pointerdown', onBack);

    this.goldText = this.add.text(730, 25, `💰 ${PLAYER_DATA.gold}`, { fontSize: '14px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);
  }

  // ============================================================
  //  ÉCRAN PRINCIPAL
  // ============================================================
  drawHub() {
    this.clearScene();
    this.header('LE RELIQUAIRE', '‹ Menu', () => this.scene.start('MenuScene'));
    this.add.text(400, 48, 'Objets de farm ciblé', { fontSize: '11px', color: '#aaaaaa' }).setOrigin(0.5);

    // --- Bandeau des consommables possédés ---
    const line1 = `✨ x${getItemCount('echo_dust')}   💎 x${getItemCount('reforge_stone')}   🔒 x${getItemCount('lock_seal')}`;
    const line2 = `🎫 x${getItemCount('pact_ticket')}   📘 x${getItemCount('xp_tome')}   🧪 x${getItemCount('stamina_elixir')}   🗝️ x${getItemCount('loot_chest_key')}`;
    this.add.text(400, 72, line1, { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(400, 90, line2, { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);

    this.elixirInfo = this.add.text(400, 112, '', { fontSize: '11px', color: '#88ff88' }).setOrigin(0.5);
    const elixirCount = getItemCount('stamina_elixir');
    const elixirBtn = this.add.rectangle(400, 130, 260, 26, elixirCount > 0 ? 0x225533 : 0x333333)
      .setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: elixirCount > 0 });
    this.add.text(400, 130, '🧪 Utiliser un Élixir de Stamina', { fontSize: '11px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    if (elixirCount > 0) {
      elixirBtn.on('pointerdown', () => {
        spendItem('stamina_elixir', 1);
        PLAYER_DATA.stamina = PLAYER_DATA.maxStamina;
        saveGameData();
        this.elixirInfo.setText('Stamina restaurée au maximum !');
        this.drawHub();
      });
    }

    const cards = [
      { icon: '🔨', title: 'ATELIER D\'ÉCHOS', desc: `Fabriquer un Écho garanti (${ATELIER_DUST_COST} ✨)`, color: 0x2a1a4a, stroke: 0xaa88ff, onClick: () => this.drawAtelier() },
      { icon: '🔷', title: 'ESSENCES DE SET', desc: 'Échanger des Essences contre un Écho', color: 0x1a2a4a, stroke: 0x88aaff, onClick: () => this.drawEssences() },
      { icon: '🧩', title: 'FRAGMENTS DE HÉROS', desc: `${FRAGMENTS_REQUIRED} fragments = 1 héros garanti`, color: 0x2a1a2a, stroke: 0xff88cc, onClick: () => this.drawFragments() },
      { icon: '🎁', title: 'COFFRES DE BUTIN', desc: `Ouvrir avec ${CHEST_KEYS_REQUIRED} 🗝️ Clés`, color: 0x2a2a1a, stroke: 0xffcc66, onClick: () => this.drawChests() }
    ];

    const cols = 2;
    const cardW = 340, cardH = 150;
    const startX = 400 - (cardW + 20) / 2;
    const startY = 220;

    cards.forEach((card, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardW + 20);
      const y = startY + row * (cardH + 20);

      const cardBg = this.add.rectangle(x, y, cardW, cardH, card.color).setStrokeStyle(2, card.stroke).setInteractive({ useHandCursor: true });
      this.add.text(x, y - 45, card.icon, { fontSize: '28px' }).setOrigin(0.5);
      this.add.text(x, y - 5, card.title, { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(x, y + 25, card.desc, { fontSize: '11px', color: '#cccccc', align: 'center', wordWrap: { width: cardW - 30 } }).setOrigin(0.5);

      cardBg.on('pointerdown', card.onClick);
      cardBg.on('pointerover', () => cardBg.setAlpha(0.85));
      cardBg.on('pointerout', () => cardBg.setAlpha(1));
    });
  }

  // ============================================================
  //  ATELIER D'ÉCHOS
  // ============================================================
  drawAtelier() {
    this.clearScene();
    this.header("ATELIER D'ÉCHOS", '‹ Reliquaire', () => this.drawHub());

    this.add.text(400, 60, `Fabriquez un Écho garanti du Set et de l'Emplacement de votre choix.`, {
      fontSize: '12px', color: '#aaaaaa', align: 'center', wordWrap: { width: 600 }
    }).setOrigin(0.5);
    this.add.text(400, 80, `Coût : ${ATELIER_DUST_COST} ✨ Poussière d'Écho  •  Possédée : ${getItemCount('echo_dust')}`, {
      fontSize: '12px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.selectedSet = this.selectedSet || ECHO_SET_KEYS[0];
    this.selectedSlot = this.selectedSlot || 1;

    this.add.text(220, 120, 'Set :', { fontSize: '12px', color: '#cccccc' }).setOrigin(0.5);
    this.createDropdown('set', 340, 120, 260,
      ECHO_SETS[this.selectedSet].name,
      ECHO_SET_KEYS.map(k => ({ value: k, label: ECHO_SETS[k].name })),
      this.selectedSet,
      (value) => { this.selectedSet = value; this.drawAtelier(); }
    );

    this.add.text(220, 156, 'Emplacement :', { fontSize: '12px', color: '#cccccc' }).setOrigin(0.5);
    this.createDropdown('slot', 340, 156, 260,
      `${this.selectedSlot}. ${ECHO_SLOTS.find(s => s.id === this.selectedSlot).short}`,
      ECHO_SLOTS.map(s => ({ value: String(s.id), label: `${s.id}. ${s.short}` })),
      String(this.selectedSlot),
      (value) => { this.selectedSlot = Number(value); this.drawAtelier(); }
    );

    const canCraft = getItemCount('echo_dust') >= ATELIER_DUST_COST;
    const craftBtn = this.add.rectangle(400, 220, 280, 44, canCraft ? 0x662299 : 0x333333)
      .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: canCraft });
    this.add.text(400, 220, 'FABRIQUER', { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    this.atelierResult = this.add.text(400, 270, '', { fontSize: '12px', color: '#88ff88', align: 'center', wordWrap: { width: 600 } }).setOrigin(0.5);

    if (canCraft) {
      craftBtn.on('pointerdown', () => {
        spendItem('echo_dust', ATELIER_DUST_COST);
        const echo = createEcho(this.selectedSet, this.selectedSlot, 'normal');
        PLAYER_DATA.echoInventory.push(echo);
        saveGameData();
        this.atelierResult.setText(`✨ Écho fabriqué : ${ECHO_SLOTS.find(s => s.id === this.selectedSlot).name} (${echo.star}★ ${echo.rarityKey}) — voir dans Échos Sanguins.`);
        this.drawAtelier();
      });
    }
  }

  // ============================================================
  //  ESSENCES DE SET
  // ============================================================
  drawEssences() {
    this.clearScene();
    this.header('ESSENCES DE SET', '‹ Reliquaire', () => this.drawHub());
    this.add.text(400, 55, `Échangez ${ESSENCE_EXCHANGE_COST} Essences contre un Écho garanti de ce Set (emplacement aléatoire).`, {
      fontSize: '12px', color: '#aaaaaa', align: 'center', wordWrap: { width: 640 }
    }).setOrigin(0.5);

    const cols = 2;
    const cardW = 340, cardH = 90;
    const startX = 400 - (cardW + 20) / 2;
    const startY = 110;

    ECHO_SET_KEYS.forEach((setKey, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardW + 20);
      const y = startY + row * (cardH + 15);

      const owned = getItemCount(getSetEssenceKey(setKey));
      const canExchange = owned >= ESSENCE_EXCHANGE_COST;

      const cardBg = this.add.rectangle(x, y, cardW, cardH, ECHO_SETS[setKey].color).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: canExchange });
      this.add.text(x - cardW / 2 + 15, y - 25, ECHO_SETS[setKey].name, { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' });
      this.add.text(x - cardW / 2 + 15, y - 3, `🔷 ${owned} / ${ESSENCE_EXCHANGE_COST}`, { fontSize: '12px', color: '#ffdd00' });
      this.add.text(x - cardW / 2 + 15, y + 20, canExchange ? 'Cliquez pour échanger' : 'Pas assez d\'Essences', { fontSize: '10px', color: canExchange ? '#88ff88' : '#888888' });

      if (canExchange) {
        cardBg.on('pointerdown', () => {
          spendItem(getSetEssenceKey(setKey), ESSENCE_EXCHANGE_COST);
          const slotId = 1 + Math.floor(Math.random() * ECHO_SLOTS.length);
          const echo = createEcho(setKey, slotId, 'boss');
          PLAYER_DATA.echoInventory.push(echo);
          saveGameData();
          this.infoResult = this.infoResult || this.add.text(400, 510, '', { fontSize: '12px', color: '#88ff88' }).setOrigin(0.5);
          this.infoResult.setText(`✨ Écho ${ECHO_SETS[setKey].name} obtenu (${echo.star}★ ${echo.rarityKey}) !`);
          this.drawEssences();
        });
        cardBg.on('pointerover', () => cardBg.setAlpha(0.85));
        cardBg.on('pointerout', () => cardBg.setAlpha(1));
      }
    });
  }

  // ============================================================
  //  FRAGMENTS DE HÉROS
  // ============================================================
  drawFragments() {
    this.clearScene();
    this.header('FRAGMENTS DE HÉROS', '‹ Reliquaire', () => this.drawHub());
    this.add.text(400, 55, `${FRAGMENTS_REQUIRED} fragments d'un héros = 1 exemplaire garanti. Obtenus sur les boss de la Tour et du Mode Cauchemar.`, {
      fontSize: '11px', color: '#aaaaaa', align: 'center', wordWrap: { width: 660 }
    }).setOrigin(0.5);

    const container = this.add.container(0, 0);
    const viewportTop = FRAGMENT_VIEWPORT.y - FRAGMENT_VIEWPORT.height / 2;

    FRAGMENT_ELIGIBLE_KEYS.forEach((unitKey, index) => {
      const unit = UNITS_DATABASE[unitKey];
      const owned = getHeroFragments(unitKey);
      const canExchange = owned >= FRAGMENTS_REQUIRED;

      const col = index % FRAGMENT_COLS;
      const row = Math.floor(index / FRAGMENT_COLS);
      const x = 150 + col * 250;
      const y = viewportTop + 70 + row * FRAGMENT_ROW_HEIGHT;

      const cardBg = this.add.rectangle(x, y, 230, 110, unit.color).setStrokeStyle(2, canExchange ? 0x00ff88 : 0xffffff).setInteractive({ useHandCursor: canExchange });
      const nameTxt = this.add.text(x, y - 35, unit.name, { fontSize: '12px', color: '#ffffff', fontStyle: 'bold', align: 'center', wordWrap: { width: 200 } }).setOrigin(0.5);
      const rarityTxt = this.add.text(x, y - 10, `[${unit.rarity}]`, { fontSize: '11px', color: '#ffdd00' }).setOrigin(0.5);
      const fragTxt = this.add.text(x, y + 12, `🧩 ${owned} / ${FRAGMENTS_REQUIRED}`, { fontSize: '12px', color: canExchange ? '#00ff88' : '#dddddd', fontStyle: 'bold' }).setOrigin(0.5);
      const actionTxt = this.add.text(x, y + 35, canExchange ? 'Cliquez pour échanger' : '', { fontSize: '10px', color: '#88ff88' }).setOrigin(0.5);

      container.add([cardBg, nameTxt, rarityTxt, fragTxt, actionTxt]);

      if (canExchange) {
        cardBg.on('pointerdown', () => {
          spendHeroFragments(unitKey, FRAGMENTS_REQUIRED);
          const instance = createUnitInstance(unitKey);
          PLAYER_DATA.inventory.push(instance);
          saveGameData();
          this.drawFragments();
        });
      }
    });

    if (FRAGMENT_ELIGIBLE_KEYS.length === 0) {
      container.add(this.add.text(400, FRAGMENT_VIEWPORT.y, 'Aucun héros éligible.', { fontSize: '13px', color: '#888888' }).setOrigin(0.5));
    }

    const rows = Math.max(1, Math.ceil(FRAGMENT_ELIGIBLE_KEYS.length / FRAGMENT_COLS));
    const contentHeight = rows * FRAGMENT_ROW_HEIGHT + 20;
    this.scrollHandle = makeScrollable(this, container, FRAGMENT_VIEWPORT, contentHeight);
  }

  // ============================================================
  //  COFFRES DE BUTIN
  // ============================================================
  drawChests() {
    this.clearScene();
    this.header('COFFRES DE BUTIN', '‹ Reliquaire', () => this.drawHub());

    const owned = getItemCount('loot_chest_key');
    const canOpen = owned >= CHEST_KEYS_REQUIRED;

    this.add.text(400, 90, `🗝️ Clés possédées : ${owned} / ${CHEST_KEYS_REQUIRED}`, { fontSize: '16px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(400, 115, 'Obtenues en explorant les chapitres de l\'Histoire Principale.', { fontSize: '11px', color: '#aaaaaa' }).setOrigin(0.5);

    this.add.rectangle(400, 250, 160, 160, 0xccaa44).setStrokeStyle(3, 0xffffff);
    this.add.text(400, 250, '🎁', { fontSize: '60px' }).setOrigin(0.5);

    const openBtn = this.add.rectangle(400, 370, 280, 46, canOpen ? 0x996622 : 0x333333)
      .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: canOpen });
    this.add.text(400, 370, `OUVRIR (${CHEST_KEYS_REQUIRED} 🗝️)`, { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    this.chestResult = this.add.text(400, 420, '', { fontSize: '13px', color: '#88ff88', align: 'center', wordWrap: { width: 600 } }).setOrigin(0.5);

    if (canOpen) {
      openBtn.on('pointerdown', () => {
        spendItem('loot_chest_key', CHEST_KEYS_REQUIRED);

        const gold = 100 + Math.floor(Math.random() * 300);
        PLAYER_DATA.gold += gold;
        let resultStr = `🪙 +${gold} Or`;

        if (Math.random() < 0.3) {
          const randomSetKey = ECHO_SET_KEYS[Math.floor(Math.random() * ECHO_SET_KEYS.length)];
          const randomSlot = 1 + Math.floor(Math.random() * ECHO_SLOTS.length);
          const echo = createEcho(randomSetKey, randomSlot, 'normal');
          PLAYER_DATA.echoInventory.push(echo);
          resultStr += `\n✨ Écho ${ECHO_SETS[randomSetKey].name} (${echo.star}★)`;
        }
        if (Math.random() < 0.2) {
          PLAYER_DATA.summonShards = (PLAYER_DATA.summonShards || 0) + 1;
          resultStr += '\n🌠 +1 Éclat de Pacte Supérieur';
        }

        saveGameData();
        this.goldText.setText(`💰 ${PLAYER_DATA.gold}`);
        this.chestResult.setText(resultStr);
        this.time.delayedCall(1200, () => this.drawChests());
      });
    }
  }

  // ============================================================
  //  MENU DÉROULANT GÉNÉRIQUE
  // ============================================================
  createDropdown(id, x, y, width, currentLabel, options, currentValue, onSelect) {
    const bg = this.add.rectangle(x, y, width, 26, 0x252a38).setStrokeStyle(1, 0x555577).setInteractive({ useHandCursor: true }).setDepth(21);
    this.add.text(x - width / 2 + 10, y, currentLabel || '...', { fontSize: '11px', color: '#ffffff' }).setOrigin(0, 0.5).setDepth(22);
    this.add.text(x + width / 2 - 14, y, '▼', { fontSize: '9px', color: '#aaaaaa' }).setOrigin(0.5).setDepth(22);

    bg.on('pointerdown', (pointer) => {
      pointer.event.stopPropagation();
      const wasThisOneOpen = this.activeDropdownKey === id;
      this.closeDropdown();
      if (wasThisOneOpen) return;

      this.activeDropdownKey = id;

      const listHeight = options.length * 24;
      const listY = y + 13 + listHeight / 2;
      const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.01).setInteractive().setDepth(299);
      const listBg = this.add.rectangle(x, listY, width, listHeight, 0x1a1e2a).setStrokeStyle(1, 0x555577).setDepth(300);
      const optionTexts = options.map((opt, i) => {
        const oy = y + 13 + i * 24 + 12;
        const t = this.add.text(x, oy, opt.label, {
          fontSize: '11px', color: opt.value === currentValue ? '#ffdd00' : '#ffffff'
        }).setOrigin(0.5).setDepth(301).setInteractive({ useHandCursor: true });
        t.on('pointerdown', (p) => {
          p.event.stopPropagation();
          this.activeDropdownCloser = null;
          this.activeDropdownKey = null;
          onSelect(opt.value);
        });
        return t;
      });

      overlay.on('pointerdown', () => this.closeDropdown());

      this.activeDropdownCloser = () => {
        overlay.destroy();
        listBg.destroy();
        optionTexts.forEach(t => t.destroy());
      };
    });
  }

  closeDropdown() {
    if (this.activeDropdownCloser) {
      this.activeDropdownCloser();
      this.activeDropdownCloser = null;
    }
    this.activeDropdownKey = null;
  }
}