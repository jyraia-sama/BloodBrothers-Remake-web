// ============================================================
//  ÉCHOS SANGUINS — LOGIQUE
//  Génération, amélioration (+1 à +15), calcul des bonus de
//  statistiques et des effets de set.
// ============================================================

import {
  ECHO_SLOTS, ECHO_SETS, ECHO_RARITY, MAX_ECHO_LEVEL, SUBSTAT_MILESTONES,
  STAT_CATEGORIES, getSlotById, getStatCategory
} from './EchoData.js';

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function weightedPick(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [key, w] of entries) {
    roll -= w;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

// --- Tables de tirage : le BOSS d'un chapitre offre de meilleures chances ---
// Combat normal : loot faible, presque toujours du bas de gamme.
const RARITY_WEIGHTS_NORMAL = { normal: 65, magique: 25, rare: 8, heroique: 1.5, legendaire: 0.5 };
const STAR_WEIGHTS_NORMAL = { 1: 42, 2: 30, 3: 17, 4: 8, 5: 2.5, 6: 0.5 };

// Boss : loot nettement meilleur, en fréquence comme en qualité.
const RARITY_WEIGHTS_BOSS = { normal: 8, magique: 18, rare: 29, heroique: 27, legendaire: 18 };
const STAR_WEIGHTS_BOSS = { 1: 4, 2: 9, 3: 19, 4: 26, 5: 24, 6: 18 };

// --- Valeur de la statistique principale selon le type, l'étoile et le niveau (+0 à +15) ---
const MAIN_STAT_FORMULAS = {
  atk_flat: (star, lvl) => Math.round((4 + star * 3) * (1 + (lvl / MAX_ECHO_LEVEL) * 2.2)),
  def_flat: (star, lvl) => Math.round((3 + star * 2) * (1 + (lvl / MAX_ECHO_LEVEL) * 2.2)),
  hp_flat: (star, lvl) => Math.round((35 + star * 25) * (1 + (lvl / MAX_ECHO_LEVEL) * 2.2)),
  atk_pct: (star, lvl) => +((1.5 + star * 0.9) * (1 + (lvl / MAX_ECHO_LEVEL) * 1.8)).toFixed(1),
  def_pct: (star, lvl) => +((1.5 + star * 0.9) * (1 + (lvl / MAX_ECHO_LEVEL) * 1.8)).toFixed(1),
  hp_pct: (star, lvl) => +((1.5 + star * 0.9) * (1 + (lvl / MAX_ECHO_LEVEL) * 1.8)).toFixed(1),
  wis_pct: (star, lvl) => +((1.5 + star * 0.9) * (1 + (lvl / MAX_ECHO_LEVEL) * 1.8)).toFixed(1),
  agi_pct: (star, lvl) => +((1 + star * 0.6) * (1 + (lvl / MAX_ECHO_LEVEL) * 1.6)).toFixed(1)
};

export function getMainStatValue(type, star, level) {
  const formula = MAIN_STAT_FORMULAS[type];
  return formula ? formula(star, level) : 0;
}

// --- Valeur gagnée à chaque "roll" de substat (octroi initial ou palier d'amélioration) ---
const SUBSTAT_BASE = {
  atk_flat: 3, def_flat: 2.5, hp_flat: 30, agi_flat: 1.5, wis_flat: 3,
  atk_pct: 0.8, def_pct: 0.8, hp_pct: 0.8, agi_pct: 0.5, wis_pct: 0.8
};

function rollSubstatValue(type, star) {
  const variance = 0.8 + Math.random() * 0.4; // 0.8 à 1.2
  const raw = SUBSTAT_BASE[type] * star * variance;
  return type.endsWith('_pct') ? +raw.toFixed(1) : Math.round(raw);
}

/**
 * Crée un nouvel Écho Sanguin.
 * @param {string} setKey - clé du set (voir ECHO_SETS)
 * @param {number} slotId - 1 à 6
 * @param {'normal'|'boss'} source - influence les tables de rareté/étoiles
 */
export function createEcho(setKey, slotId, source = 'normal') {
  const slot = getSlotById(slotId);
  const mainStatType = randomFrom(slot.mainStatOptions);
  const rarityKey = weightedPick(source === 'boss' ? RARITY_WEIGHTS_BOSS : RARITY_WEIGHTS_NORMAL);
  const star = Number(weightedPick(source === 'boss' ? STAR_WEIGHTS_BOSS : STAR_WEIGHTS_NORMAL));
  const substatCount = ECHO_RARITY[rarityKey].substats;

  const mainCategory = getStatCategory(mainStatType);
  const availableCategories = shuffle(STAT_CATEGORIES.filter(c => c !== mainCategory));
  const chosenCategories = availableCategories.slice(0, substatCount);

  const substats = chosenCategories.map(cat => {
    const variant = Math.random() < 0.5 ? 'flat' : 'pct';
    const type = `${cat}_${variant}`;
    return { type, value: rollSubstatValue(type, star) };
  });

  return {
    echoId: `echo_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
    setKey,
    slotId,
    star,
    rarityKey,
    level: 0,
    mainStatType,
    mainStatValue: getMainStatValue(mainStatType, star, 0),
    substats,
    equippedTo: null
  };
}

// --- Amélioration (+1 à +15) ---
export function getUpgradeCost(echo) {
  return Math.round(80 * Math.pow(echo.level + 1, 1.6)) + 40;
}

export function getUpgradeSuccessRate(level) {
  const rates = { 9: 0.9, 10: 0.8, 11: 0.7, 12: 0.6, 13: 0.5, 14: 0.4 };
  if (level < 9) return 1;
  return rates[level] ?? 0.4;
}

/**
 * Tente une amélioration. Modifie `echo` directement en cas de succès.
 * Un échec consomme l'or (géré par l'appelant) mais ne dégrade jamais l'Écho.
 */
export function upgradeEcho(echo) {
  if (echo.level >= MAX_ECHO_LEVEL) return { success: false, reason: 'max' };

  const rate = getUpgradeSuccessRate(echo.level);
  if (Math.random() >= rate) return { success: false, reason: 'fail' };

  echo.level += 1;
  echo.mainStatValue = getMainStatValue(echo.mainStatType, echo.star, echo.level);

  let substatEvent = null;
  if (SUBSTAT_MILESTONES.includes(echo.level)) {
    if (echo.substats.length < 4) {
      const mainCategory = getStatCategory(echo.mainStatType);
      const usedCategories = echo.substats.map(s => getStatCategory(s.type));
      const available = STAT_CATEGORIES.filter(c => c !== mainCategory && !usedCategories.includes(c));
      const cat = randomFrom(available.length > 0 ? available : STAT_CATEGORIES.filter(c => c !== mainCategory));
      const variant = Math.random() < 0.5 ? 'flat' : 'pct';
      const type = `${cat}_${variant}`;
      const value = rollSubstatValue(type, echo.star);
      echo.substats.push({ type, value });
      substatEvent = { kind: 'new', type, value };
    } else {
      const idx = Math.floor(Math.random() * echo.substats.length);
      const added = rollSubstatValue(echo.substats[idx].type, echo.star);
      echo.substats[idx].value = +(echo.substats[idx].value + added).toFixed(1);
      substatEvent = { kind: 'boost', type: echo.substats[idx].type, value: added };
    }
  }

  return { success: true, level: echo.level, substatEvent };
}

// --- Bonus de statistiques ---
function emptyBonus() {
  return { atk: 0, def: 0, hp: 0, agi: 0, wis: 0, atkPct: 0, defPct: 0, hpPct: 0, agiPct: 0, wisPct: 0 };
}

export function getEchoStatBonuses(echo) {
  const bonus = emptyBonus();
  const apply = (type, value) => {
    const [cat, variant] = type.split('_');
    if (variant === 'flat') bonus[cat] += value;
    else bonus[`${cat}Pct`] += value;
  };
  apply(echo.mainStatType, echo.mainStatValue);
  echo.substats.forEach(s => apply(s.type, s.value));
  return bonus;
}

export function sumEchoBonuses(echoes) {
  const total = emptyBonus();
  echoes.forEach(echo => {
    const b = getEchoStatBonuses(echo);
    Object.keys(total).forEach(k => { total[k] += b[k]; });
  });
  return total;
}

// --- Sets actifs selon les échos équipés ---
export function computeActiveSets(echoes) {
  const counts = {};
  echoes.forEach(e => { counts[e.setKey] = (counts[e.setKey] || 0) + 1; });

  const active = [];
  Object.entries(counts).forEach(([setKey, count]) => {
    const def = ECHO_SETS[setKey];
    if (!def) return;
    const timesActive = Math.floor(count / def.pieces);
    for (let i = 0; i < timesActive; i++) active.push(setKey);
  });
  return active;
}

const SET_STAT_BONUSES = {
  energy: { stat: 'hp', pct: 15 },
  guard: { stat: 'def', pct: 15 },
  swift: { stat: 'agi', pct: 25 },
  fatal: { stat: 'atk', pct: 35 }
};

/**
 * Applique les échos équipés (bonus + sets) aux stats de base d'une unité.
 * `activeSets` (Violent/Vampire/Shield) doit être géré séparément en combat.
 */
export function applyEchoesToStats(baseStats, echoes) {
  if (!echoes || echoes.length === 0) {
    return { ...baseStats, activeSets: [] };
  }

  const totals = sumEchoBonuses(echoes);
  const activeSets = computeActiveSets(echoes);

  let atk = baseStats.atk + totals.atk;
  let def = baseStats.def + totals.def;
  let hp = baseStats.hp + totals.hp;
  let agi = baseStats.agi + totals.agi;
  let wis = baseStats.wis + totals.wis;

  atk *= 1 + totals.atkPct / 100;
  def *= 1 + totals.defPct / 100;
  hp *= 1 + totals.hpPct / 100;
  agi *= 1 + totals.agiPct / 100;
  wis *= 1 + totals.wisPct / 100;

  activeSets.forEach(setKey => {
    const setBonus = SET_STAT_BONUSES[setKey];
    if (!setBonus) return;
    if (setBonus.stat === 'hp') hp *= 1 + setBonus.pct / 100;
    if (setBonus.stat === 'def') def *= 1 + setBonus.pct / 100;
    if (setBonus.stat === 'agi') agi *= 1 + setBonus.pct / 100;
    if (setBonus.stat === 'atk') atk *= 1 + setBonus.pct / 100;
  });

  return {
    ...baseStats,
    atk: Math.round(atk),
    def: Math.round(def),
    hp: Math.round(hp),
    maxHp: Math.round(hp),
    agi: Math.round(agi),
    wis: Math.round(wis),
    activeSets
  };
}

// --- Vente ---
const SELL_RARITY_MULTIPLIER = { normal: 1, magique: 1.5, rare: 2.5, heroique: 4, legendaire: 7 };

export function getEchoSellPrice(echo) {
  const rarityMult = SELL_RARITY_MULTIPLIER[echo.rarityKey] || 1;
  return Math.round(15 * echo.star * rarityMult * (1 + echo.level * 0.15));
}