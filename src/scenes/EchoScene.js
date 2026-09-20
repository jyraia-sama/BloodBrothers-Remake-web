import { PLAYER_DATA, saveGameData, getEquippedEchoes, getItemCount, addItem, spendItem } from '../saveSystem.js';
import { UNITS_DATABASE } from '../database.js';
import {
  ECHO_SLOTS, ECHO_SETS, ECHO_SET_KEYS, ECHO_RARITY, STAT_LABELS, MAX_ECHO_LEVEL,
  getSlotById, formatStatValue
} from '../EchoData.js';
import {
  getUpgradeCost, getUpgradeSuccessRate, upgradeEcho, getEchoSellPrice, getEchoDustValue,
  rerollSubstat, computeActiveSets
} from '../echoSystem.js';
import { makeScrollable } from '../scrollHelper.js';

const HERO_VIEWPORT = { x: 400, y: 335, width: 720, height: 490 };
const HERO_COLS = 4;
const HERO_ROW_HEIGHT = 130;

const RESERVE_VIEWPORT = { x: 400, y: 465, width: 760, height: 200 };
const RESERVE_COLS = 6;
const RESERVE_ROW_HEIGHT = 118;

const SLOT_GRID_POS = [
  { x: 270, y: 130 }, { x: 400, y: 130 }, { x: 530, y: 130 },
  { x: 270, y: 220 }, { x: 400, y: 220 }, { x: 530, y: 220 }
];

export class EchoScene extends Phaser.Scene {
  constructor() { super({ key: 'EchoScene' }); }

  create() {
    this.filters = { setKey: 'all', slotId: 'all', rarityKey: 'all' };
    this.selectedUnitId = null;
    this.heroScroll = null;
    this.reserveScroll = null;
    this.activeDropdownCloser = null;
    this.activeDropdownKey = null;

    this.drawHeroList();
  }

  clearScene() {
    this.closeDropdown();
    if (this.heroScroll) { this.heroScroll.destroy(); this.heroScroll = null; }
    if (this.reserveScroll) { this.reserveScroll.destroy(); this.reserveScroll = null; }
    this.children.removeAll(true); // true = detruit reellement les objets (sinon leurs zones cliquables restent actives)
  }

  closeDropdown() {
    if (this.activeDropdownCloser) {
      this.activeDropdownCloser();
      this.activeDropdownCloser = null;
    }
    this.activeDropdownKey = null;
  }

  // ============================================================
  //  ÉCRAN A — CHOIX DU HÉROS
  // ============================================================
  drawHeroList() {
    this.clearScene();
    this.selectedUnitId = null;

    this.add.rectangle(400, 300, 800, 600, 0x0f1018);
    this.add.text(400, 25, 'ÉCHOS SANGUINS', { fontSize: '24px', color: '#ff66cc', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(400, 52, 'Choisissez un héros à équiper', { fontSize: '12px', color: '#aaaaaa' }).setOrigin(0.5);

    const backBtn = this.add.rectangle(70, 25, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff).setDepth(50);
    this.add.text(70, 25, '‹ Menu', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5).setDepth(51);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.add.text(730, 25, `💰 ${PLAYER_DATA.gold}`, { fontSize: '14px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);

    const container = this.add.container(0, 0);
    const viewportTop = HERO_VIEWPORT.y - HERO_VIEWPORT.height / 2;

    PLAYER_DATA.inventory.forEach((inst, index) => {
      const base = UNITS_DATABASE[inst.unitKey];
      const col = index % HERO_COLS;
      const row = Math.floor(index / HERO_COLS);
      const x = 130 + col * 180;
      const y = viewportTop + 70 + row * HERO_ROW_HEIGHT;

      const isEquipped = PLAYER_DATA.deck.includes(inst.instanceId);
      const echoCount = PLAYER_DATA.echoInventory.filter(e => e.equippedTo === inst.instanceId).length;

      const card = this.add.rectangle(x, y, 160, 110, base.color).setStrokeStyle(2, isEquipped ? 0x00ff88 : 0xffffff).setInteractive({ useHandCursor: true });
      const nameText = this.add.text(x, y - 36, base.name.split(' ')[0], { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
      const lvlText = this.add.text(x, y - 16, `Nv. ${inst.level}`, { fontSize: '11px', color: '#00ffaa' }).setOrigin(0.5);
      const echoText = this.add.text(x, y + 6, `🩸 Échos : ${echoCount}/6`, { fontSize: '11px', color: '#ffcccc' }).setOrigin(0.5);
      const tagText = this.add.text(x, y + 26, isEquipped ? '★ Dans l\'équipe' : ' ', { fontSize: '9px', color: '#00ff88' }).setOrigin(0.5);

      card.on('pointerover', () => card.setAlpha(0.85));
      card.on('pointerout', () => card.setAlpha(1));
      card.on('pointerdown', () => this.drawEquipMenu(inst.instanceId));

      container.add([card, nameText, lvlText, echoText, tagText]);
    });

    if (PLAYER_DATA.inventory.length === 0) {
      container.add(this.add.text(400, HERO_VIEWPORT.y, 'Aucune unité possédée.', { fontSize: '14px', color: '#888888' }).setOrigin(0.5));
    }

    const rows = Math.max(1, Math.ceil(PLAYER_DATA.inventory.length / HERO_COLS));
    const contentHeight = rows * HERO_ROW_HEIGHT + 20;
    this.heroScroll = makeScrollable(this, container, HERO_VIEWPORT, contentHeight);
  }

  // ============================================================
  //  ÉCRAN B — SOUS-MENU : ÉQUIPER LES ÉCHOS D'UN HÉROS
  // ============================================================
  drawEquipMenu(unitInstanceId, initialReserveScroll = 0) {
    this.clearScene();
    this.selectedUnitId = unitInstanceId;

    const unit = PLAYER_DATA.inventory.find(i => i.instanceId === unitInstanceId);
    const base = UNITS_DATABASE[unit.unitKey];

    this.add.rectangle(400, 300, 800, 600, 0x0f1018);

    const backBtn = this.add.rectangle(70, 25, 100, 30, 0x444455).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0xffffff).setDepth(50);
    this.add.text(70, 25, '‹ Héros', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5).setDepth(51);
    backBtn.on('pointerdown', () => this.drawHeroList());

    this.goldText = this.add.text(730, 25, `💰 ${PLAYER_DATA.gold}`, { fontSize: '14px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);

    this.add.text(400, 25, `${base.name} — Nv. ${unit.level}`, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(400, 50, 'Cliquez un emplacement pour le retirer, ou un Écho de la réserve pour l\'équiper', { fontSize: '11px', color: '#aaaaaa' }).setOrigin(0.5);

    this.renderSlotGrid();
    this.renderReserveFilters();
    this.renderReserveGrid(initialReserveScroll);
  }

  refreshEquipMenu() {
    const previousScroll = this.reserveScroll ? this.reserveScroll.getScroll() : 0;
    this.drawEquipMenu(this.selectedUnitId, previousScroll);
  }

  // ============================================================
  //  GRILLE DES 6 EMPLACEMENTS
  // ============================================================
  renderSlotGrid() {
    const equipped = getEquippedEchoes(this.selectedUnitId);

    ECHO_SLOTS.forEach((slot, i) => {
      const pos = SLOT_GRID_POS[i];
      const echo = equipped.find(e => e.slotId === slot.id);
      const rarityDef = echo ? ECHO_RARITY[echo.rarityKey] : null;

      const box = this.add.rectangle(pos.x, pos.y, 118, 80, echo ? rarityDef.color : 0x1a1d28)
        .setStrokeStyle(2, echo ? 0xffffff : 0x444455)
        .setInteractive({ useHandCursor: true })
        .setDepth(20);
      this.add.text(pos.x, pos.y - 32, slot.short, { fontSize: '10px', color: '#cccccc', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);

      if (echo) {
        const mainLabel = `${STAT_LABELS[echo.mainStatType]} ${formatStatValue(echo.mainStatType, echo.mainStatValue)}`;
        this.add.text(pos.x, pos.y - 12, '★'.repeat(echo.star), { fontSize: '10px', color: '#ffdd00' }).setOrigin(0.5).setDepth(21);
        this.add.text(pos.x, pos.y + 5, mainLabel, { fontSize: '11px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
        this.add.text(pos.x, pos.y + 22, `+${echo.level}  •  ${ECHO_SETS[echo.setKey].name}`, { fontSize: '9px', color: '#dddddd' }).setOrigin(0.5).setDepth(21);

        box.on('pointerdown', () => {
          echo.equippedTo = null;
          saveGameData();
          this.refreshEquipMenu();
        });

        const infoBtn = this.add.circle(pos.x + 50, pos.y - 31, 10, 0x111111).setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true }).setDepth(20);
        this.add.text(pos.x + 50, pos.y - 31, '?', { fontSize: '10px', color: '#fff' }).setOrigin(0.5).setDepth(21);
        infoBtn.on('pointerdown', (pointer) => {
          pointer.event.stopPropagation();
          this.showEchoDetails(echo);
        });
      } else {
        this.add.text(pos.x, pos.y + 6, 'Vide', { fontSize: '12px', color: '#666666' }).setOrigin(0.5).setDepth(21);
      }
    });

    const activeSets = computeActiveSets(equipped);
    const setsStr = activeSets.length > 0
      ? `Sets actifs : ${activeSets.map(s => ECHO_SETS[s].name).join(', ')}`
      : 'Aucun set actif';
    this.add.text(400, 275, setsStr, { fontSize: '12px', color: '#88ff88', fontStyle: 'bold' }).setOrigin(0.5);
  }

  // ============================================================
  //  FILTRES (menus déroulants) DE LA RÉSERVE
  // ============================================================
  renderReserveFilters() {
    this.add.text(400, 298, 'RÉSERVE D\'ÉCHOS', { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    const setOptions = [{ value: 'all', label: 'Tous les sets' }, ...ECHO_SET_KEYS.map(k => ({ value: k, label: ECHO_SETS[k].name }))];
    const slotOptions = [{ value: 'all', label: 'Tous les slots' }, ...ECHO_SLOTS.map(s => ({ value: String(s.id), label: `${s.id}. ${s.short}` }))];
    const rarityOptions = [{ value: 'all', label: 'Toutes raretés' }, ...Object.entries(ECHO_RARITY).map(([k, r]) => ({ value: k, label: r.label }))];

    const setLabel = setOptions.find(o => o.value === this.filters.setKey)?.label;
    const slotLabel = slotOptions.find(o => o.value === String(this.filters.slotId))?.label;
    const rarityLabel = rarityOptions.find(o => o.value === this.filters.rarityKey)?.label;

    this.createDropdown('filterSet', 160, 318, 200, setLabel, setOptions, this.filters.setKey, (value) => {
      this.filters.setKey = value;
      this.refreshEquipMenu();
    });
    this.createDropdown('filterSlot', 400, 318, 190, slotLabel, slotOptions, String(this.filters.slotId), (value) => {
      this.filters.slotId = value;
      this.refreshEquipMenu();
    });
    this.createDropdown('filterRarity', 630, 318, 190, rarityLabel, rarityOptions, this.filters.rarityKey, (value) => {
      this.filters.rarityKey = value;
      this.refreshEquipMenu();
    });

    this.infoText = this.add.text(400, 342, '', { fontSize: '11px', color: '#ff8888' }).setOrigin(0.5);
  }

  getFilteredReserve() {
    return PLAYER_DATA.echoInventory.filter(e => {
      if (e.equippedTo) return false;
      if (this.filters.setKey !== 'all' && e.setKey !== this.filters.setKey) return false;
      if (this.filters.slotId !== 'all' && String(e.slotId) !== String(this.filters.slotId)) return false;
      if (this.filters.rarityKey !== 'all' && e.rarityKey !== this.filters.rarityKey) return false;
      return true;
    });
  }

  // ============================================================
  //  GRILLE DÉROULANTE DE LA RÉSERVE
  // ============================================================
  renderReserveGrid(initialScroll = 0) {
    const container = this.add.container(0, 0);
    const echoes = this.getFilteredReserve();

    const viewportTop = RESERVE_VIEWPORT.y - RESERVE_VIEWPORT.height / 2;
    const firstRowY = viewportTop + 60;

    echoes.forEach((echo, index) => {
      const x = 75 + (index % RESERVE_COLS) * 110;
      const y = firstRowY + Math.floor(index / RESERVE_COLS) * RESERVE_ROW_HEIGHT;

      const rarityDef = ECHO_RARITY[echo.rarityKey];
      const slot = getSlotById(echo.slotId);

      const card = this.add.rectangle(x, y, 100, 105, rarityDef.color).setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true });
      const setTag = this.add.rectangle(x, y - 45, 100, 14, ECHO_SETS[echo.setKey].color).setOrigin(0.5);
      const setLabel = this.add.text(x, y - 45, ECHO_SETS[echo.setKey].name, { fontSize: '9px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

      const slotLabel = this.add.text(x, y - 28, `${slot.id}. ${slot.short}`, { fontSize: '10px', color: '#dddddd' }).setOrigin(0.5);
      const starLabel = this.add.text(x, y - 12, '★'.repeat(echo.star), { fontSize: '10px', color: '#ffdd00' }).setOrigin(0.5);
      const mainLabel = this.add.text(x, y + 6, `${STAT_LABELS[echo.mainStatType]} ${formatStatValue(echo.mainStatType, echo.mainStatValue)}`, {
        fontSize: '10px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);
      const lvlLabel = this.add.text(x, y + 22, `+${echo.level}  •  ${rarityDef.label}`, { fontSize: '9px', color: '#cccccc' }).setOrigin(0.5);

      const infoBtn = this.add.circle(x + 38, y - 45, 9, 0x111111).setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true });
      const infoLabel = this.add.text(x + 38, y - 45, '?', { fontSize: '9px', color: '#fff' }).setOrigin(0.5);

      infoBtn.on('pointerdown', (pointer) => {
        pointer.event.stopPropagation();
        this.showEchoDetails(echo);
      });

      card.on('pointerdown', () => {
        const current = PLAYER_DATA.echoInventory.find(e => e.equippedTo === this.selectedUnitId && e.slotId === echo.slotId);
        if (current) current.equippedTo = null;
        echo.equippedTo = this.selectedUnitId;
        saveGameData();
        this.refreshEquipMenu();
      });

      container.add([card, setTag, setLabel, slotLabel, starLabel, mainLabel, lvlLabel, infoBtn, infoLabel]);
    });

    if (echoes.length === 0) {
      container.add(
        this.add.text(400, RESERVE_VIEWPORT.y, 'Aucun Écho ne correspond à ces filtres.', { fontSize: '13px', color: '#888888' }).setOrigin(0.5)
      );
    }

    const rows = Math.max(1, Math.ceil(echoes.length / RESERVE_COLS));
    const contentHeight = rows * RESERVE_ROW_HEIGHT + 20;
    this.reserveScroll = makeScrollable(this, container, RESERVE_VIEWPORT, contentHeight, { initialScroll });
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
      if (wasThisOneOpen) return; // clic sur le même dropdown : on le referme simplement

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
          // On applique la sélection AVANT toute destruction, pour ne jamais
          // détruire cet objet à l'intérieur de son propre gestionnaire de clic.
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

  // ============================================================
  //  DÉTAILS D'UN ÉCHO (amélioration, vente, équiper/déséquiper)
  // ============================================================
  showEchoDetails(echo) {
    if (this.modalContainer) this.modalContainer.destroy();
    this.closeDropdown();

    const slot = getSlotById(echo.slotId);
    const rarityDef = ECHO_RARITY[echo.rarityKey];
    const setDef = ECHO_SETS[echo.setKey];

    this.modalContainer = this.add.container(0, 0).setDepth(400);

    const overlay = this.add.rectangle(400, 280, 800, 600, 0x000000, 0.75).setInteractive();
    const panel = this.add.rectangle(400, 280, 400, 430, 0x1a1d28).setStrokeStyle(2, rarityDef.color);

    const title = this.add.text(400, 95, `${slot.name}`, { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    const subtitle = this.add.text(400, 117, `${rarityDef.label}  •  ${'★'.repeat(echo.star)}`, { fontSize: '13px', color: '#ffdd00' }).setOrigin(0.5);
    const setLine = this.add.text(400, 137, `Set : ${setDef.name}`, { fontSize: '12px', color: '#88ddff' }).setOrigin(0.5);
    const levelLine = this.add.text(400, 158, `Niveau +${echo.level} / +${MAX_ECHO_LEVEL}`, { fontSize: '13px', color: '#00ffaa' }).setOrigin(0.5);

    const mainStr = `Principale : ${STAT_LABELS[echo.mainStatType]} ${formatStatValue(echo.mainStatType, echo.mainStatValue)}`;
    const mainText = this.add.text(400, 180, mainStr, { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    const substatsHeader = this.add.text(400, 202,
      `Substats   (💎 x${getItemCount('reforge_stone')}   🔒 x${getItemCount('lock_seal')})`,
      { fontSize: '11px', color: '#aaaaaa' }
    ).setOrigin(0.5);

    const elements = [overlay, panel, title, subtitle, setLine, levelLine, mainText, substatsHeader];
    const resultText = this.add.text(400, 342, '', { fontSize: '12px', color: '#ffcc00' }).setOrigin(0.5);

    if (echo.substats.length === 0) {
      elements.push(this.add.text(400, 220, 'Aucune substat', { fontSize: '12px', color: '#888888' }).setOrigin(0.5));
    } else {
      echo.substats.forEach((s, idx) => {
        const rowY = 220 + idx * 21;
        const rowText = this.add.text(230, rowY, `${STAT_LABELS[s.type]} ${formatStatValue(s.type, s.value)}`, {
          fontSize: '12px', color: s.locked ? '#ffdd00' : '#ffffff'
        }).setOrigin(0, 0.5);

        const lockIcon = this.add.text(495, rowY, s.locked ? '🔒' : '🔓', { fontSize: '13px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        lockIcon.on('pointerdown', () => {
          if (s.locked) {
            s.locked = false;
          } else {
            if (!spendItem('lock_seal', 1)) {
              resultText.setText('Aucun Sceau de Verrouillage.').setColor('#ff4444');
              return;
            }
            s.locked = true;
          }
          saveGameData();
          this.modalContainer.destroy();
          this.showEchoDetails(echo);
        });

        const reforgeIcon = this.add.text(525, rowY, '🔄', { fontSize: '13px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        reforgeIcon.on('pointerdown', () => {
          if (!spendItem('reforge_stone', 1)) {
            resultText.setText('Aucune Pierre de Reforge.').setColor('#ff4444');
            return;
          }
          rerollSubstat(echo, idx);
          saveGameData();
          this.modalContainer.destroy();
          this.refreshEquipMenu();
          this.showEchoDetails(echo);
        });

        elements.push(rowText, lockIcon, reforgeIcon);
      });
    }

    const isMax = echo.level >= MAX_ECHO_LEVEL;
    const cost = isMax ? 0 : getUpgradeCost(echo);
    const rate = isMax ? 0 : Math.round(getUpgradeSuccessRate(echo.level) * 100);
    const upgradeLabel = isMax ? 'NIVEAU MAXIMUM' : `Améliorer (${cost} Or • ${rate}%)`;

    const upgradeBtn = this.add.rectangle(400, 315, 300, 36, isMax ? 0x333333 : 0x226633)
      .setStrokeStyle(1, 0xffffff)
      .setInteractive({ useHandCursor: !isMax });
    const upgradeText = this.add.text(400, 315, upgradeLabel, { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    if (!isMax) {
      upgradeBtn.on('pointerdown', () => {
        const upgradeCost = getUpgradeCost(echo);
        if (PLAYER_DATA.gold < upgradeCost) {
          resultText.setText('Pas assez d\'or !').setColor('#ff4444');
          return;
        }
        PLAYER_DATA.gold -= upgradeCost;
        const result = upgradeEcho(echo);
        saveGameData();
        this.goldText.setText(`💰 ${PLAYER_DATA.gold}`);

        if (result.success) {
          let msg = `✨ Amélioré en +${result.level} !`;
          if (result.substatEvent?.kind === 'new') msg += ` Nouvelle substat : ${STAT_LABELS[result.substatEvent.type]}.`;
          if (result.substatEvent?.kind === 'boost') msg += ` ${STAT_LABELS[result.substatEvent.type]} augmentée.`;
          resultText.setText(msg).setColor('#00ff88');
        } else {
          resultText.setText('Échec de l\'amélioration... (or perdu)').setColor('#ff4444');
        }

        this.time.delayedCall(900, () => {
          this.modalContainer.destroy();
          this.refreshEquipMenu();
          this.showEchoDetails(echo);
        });
      });
    }

    const isEquipped = !!echo.equippedTo;
    const equipLabel = isEquipped ? 'Déséquiper' : 'Équiper sur ce héros';
    const equipBtn = this.add.rectangle(400, 374, 300, 32, 0x334477).setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true });
    const equipText = this.add.text(400, 374, equipLabel, { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);

    equipBtn.on('pointerdown', () => {
      if (isEquipped) {
        echo.equippedTo = null;
      } else {
        const current = PLAYER_DATA.echoInventory.find(e => e.equippedTo === this.selectedUnitId && e.slotId === echo.slotId);
        if (current) current.equippedTo = null;
        echo.equippedTo = this.selectedUnitId;
      }
      saveGameData();
      this.modalContainer.destroy();
      this.refreshEquipMenu();
    });

    const sellPrice = getEchoSellPrice(echo);
    const dustValue = getEchoDustValue(echo);
    const sellBtn = this.add.rectangle(400, 408, 300, 32, 0x772222).setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true });
    const sellText = this.add.text(400, 408, `Désenchanter (${sellPrice} Or + ${dustValue} ✨)`, { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);

    sellBtn.on('pointerdown', () => {
      echo.equippedTo = null;
      PLAYER_DATA.echoInventory = PLAYER_DATA.echoInventory.filter(e => e.echoId !== echo.echoId);
      PLAYER_DATA.gold += sellPrice;
      addItem('echo_dust', dustValue);
      saveGameData();
      this.modalContainer.destroy();
      this.refreshEquipMenu();
    });

    const closeBtn = this.add.rectangle(400, 458, 140, 32, 0x252a38).setStrokeStyle(1, 0x9da3b0).setInteractive({ useHandCursor: true });
    const closeText = this.add.text(400, 458, 'Fermer', { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    closeBtn.on('pointerdown', () => this.modalContainer.destroy());
    overlay.on('pointerdown', () => this.modalContainer.destroy());

    elements.push(upgradeBtn, upgradeText, resultText, equipBtn, equipText, sellBtn, sellText, closeBtn, closeText);
    this.modalContainer.add(elements);
  }
}