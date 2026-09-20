import { createUnitInstance, maxStaminaForAccountLevel } from './levelSystem.js';
import { CHAPTERS_DATABASE } from './database.js';

const SAVE_KEY = 'BLOOD_BROTHERS_SAVE_V2';
const STAMINA_REGEN_INTERVAL = 5 * 60 * 1000;

// Incrémenté à chaque refonte structurelle de l'Aventure (Actes/Chapitres).
// Une sauvegarde d'une version antérieure voit sa progression de chapitre
// réinitialisée (son or, ses cartes et ses Échos sont conservés).
const CONTENT_VERSION = 2;

/** Horodatage du prochain minuit local (reset du Donjon Quotidien). */
function getNextMidnight() {
  const next = new Date();
  next.setHours(24, 0, 0, 0);
  return next.getTime();
}

/** Horodatage dans 7 jours (reset hebdomadaire de la Tour Sans Fin). */
function getNextWeeklyReset() {
  return Date.now() + 7 * 24 * 60 * 60 * 1000;
}

function buildDefaultData() {
  const starters = ['archer', 'mage', 'clerc'].map(key => createUnitInstance(key));

  return {
    hasChosenHero: false,
    stamina: 10,
    maxStamina: 10,
    lastStaminaUpdate: Date.now(),
    accountLevel: 1,
    accountXp: 0,
    gold: 500,
    summonShards: 0, // Éclats de Pacte Supérieur (drop de boss)
    unlockedChapter: 1,
    currentChapter: 1,
    currentTileId: 0,
    inventory: starters,                          // tableau d'instances
    deck: starters.map(inst => inst.instanceId),  // tableau d'instanceId
    echoInventory: [],                            // tableau d'Échos Sanguins possédés
    items: {},                                     // { itemKey: quantite } - Le Reliquaire
    heroFragments: {},                             // { unitKey: quantite } - fragments de héros SSR/UR
    contentVersion: CONTENT_VERSION,
    dailyDungeonRunsLeft: 3,
    dailyDungeonResetAt: getNextMidnight(),
    towerHighestFloor: 0,
    towerResetAt: getNextWeeklyReset(),
    nightmareMode: false
  };
}

export function loadGameData() {
  const saved = localStorage.getItem(SAVE_KEY);
  let data = saved ? JSON.parse(saved) : buildDefaultData();

  // --- Migration : ancien systeme de carte (index lineaire) ---
  if (data.currentTileId === undefined) {
    data.currentTileId = 0;
    delete data.currentTileIndex;
  }
  if (data.unlockedChapter === undefined) {
    data.unlockedChapter = 1;
  }
  if (data.summonShards === undefined) {
    data.summonShards = 0;
  }
  if (!Array.isArray(data.echoInventory)) {
    data.echoInventory = [];
  }
  if (!data.items || typeof data.items !== 'object') {
    data.items = {};
  }
  if (!data.heroFragments || typeof data.heroFragments !== 'object') {
    data.heroFragments = {};
  }
  if (data.dailyDungeonRunsLeft === undefined) {
    data.dailyDungeonRunsLeft = 3;
    data.dailyDungeonResetAt = getNextMidnight();
  }
  if (data.towerHighestFloor === undefined) {
    data.towerHighestFloor = 0;
  }
  if (data.towerResetAt === undefined) {
    data.towerResetAt = getNextWeeklyReset();
  }
  if (data.nightmareMode === undefined) {
    data.nightmareMode = false;
  }

  // --- Reset quotidien du Donjon Quotidien ---
  if (Date.now() >= data.dailyDungeonResetAt) {
    data.dailyDungeonRunsLeft = 3;
    data.dailyDungeonResetAt = getNextMidnight();
  }

  // --- Reset hebdomadaire de la Tour Sans Fin ---
  if (Date.now() >= data.towerResetAt) {
    data.towerHighestFloor = 0;
    data.towerResetAt = getNextWeeklyReset();
  }

  // --- Migration : refonte de l'Aventure (Actes/Chapitres liés aux Échos) ---
  // La progression de chapitre n'a plus le même sens ; on la réinitialise
  // sans toucher à l'or, aux cartes ni aux Échos déjà possédés.
  if (data.contentVersion !== CONTENT_VERSION) {
    data.unlockedChapter = 1;
    data.currentChapter = 1;
    data.currentTileId = 0;
    data.contentVersion = CONTENT_VERSION;
  }

  // --- Migration : inventaire de cles -> inventaire d'instances ---
  if (Array.isArray(data.inventory) && data.inventory.some(entry => typeof entry === 'string')) {
    const oldDeck = Array.isArray(data.deck) ? [...data.deck] : [];

    data.inventory = data.inventory.map(entry =>
      typeof entry === 'string' ? createUnitInstance(entry) : entry
    );

    // Reconstruit le deck : pour chaque ancienne cle, on prend une instance
    // correspondante encore non assignee.
    const used = new Set();
    data.deck = [];
    oldDeck.forEach(key => {
      if (typeof key !== 'string') return;
      const match = data.inventory.find(inst => inst.unitKey === key && !used.has(inst.instanceId));
      if (match) {
        used.add(match.instanceId);
        data.deck.push(match.instanceId);
      }
    });
  }

  // --- Compte : niveau global et stamina max derivee ---
  if (data.accountLevel === undefined) data.accountLevel = 1;
  if (data.accountXp === undefined) data.accountXp = 0;
  data.maxStamina = maxStaminaForAccountLevel(data.accountLevel);

  // --- Filet de securite : toute cle brute restee dans l'inventaire
  // (ex. heros ajoute par HeroSelectScene) est convertie en instance,
  // sinon elle est invisible dans le deck et en combat. ---
  if (Array.isArray(data.inventory)) {
    data.inventory = data.inventory.map(entry =>
      typeof entry === 'string' ? createUnitInstance(entry) : entry
    );
  }

  // Idem pour le deck : une cle brute est remplacee par l'instanceId
  // d'une unite correspondante encore libre.
  if (Array.isArray(data.deck) && Array.isArray(data.inventory)) {
    const alreadyUsed = new Set(data.deck.filter(e => typeof e !== 'string'));
    data.deck = data.deck.map(entry => {
      if (typeof entry !== 'string') return entry;
      const validIds = new Set(data.inventory.map(i => i.instanceId));
      if (validIds.has(entry)) return entry; // c'est deja un instanceId

      const match = data.inventory.find(
        inst => inst.unitKey === entry && !alreadyUsed.has(inst.instanceId)
      );
      if (match) {
        alreadyUsed.add(match.instanceId);
        return match.instanceId;
      }
      return null;
    }).filter(Boolean);
  }

  // Securite : champs manquants sur d'anciennes instances
  if (Array.isArray(data.inventory)) {
    data.inventory.forEach(inst => {
      if (inst.level === undefined) inst.level = 1;
      if (inst.xp === undefined) inst.xp = 0;
      if (inst.fusionCount === undefined) inst.fusionCount = 0;
    });
  }

  // Nettoyage : retire du deck les instanceId qui n'existent plus
  if (Array.isArray(data.deck) && Array.isArray(data.inventory)) {
    const validIds = new Set(data.inventory.map(i => i.instanceId));
    data.deck = data.deck.filter(id => validIds.has(id));
  }

  // --- Regeneration de stamina hors-ligne ---
  const now = Date.now();
  const timePassed = now - (data.lastStaminaUpdate || now);
  const staminaToGained = Math.floor(timePassed / STAMINA_REGEN_INTERVAL);

  if (staminaToGained > 0 && data.stamina < data.maxStamina) {
    data.stamina = Math.min(data.maxStamina, data.stamina + staminaToGained);
    data.lastStaminaUpdate = now - (timePassed % STAMINA_REGEN_INTERVAL);
  } else if (data.stamina >= data.maxStamina) {
    data.lastStaminaUpdate = now;
  }

  return data;
}

export function saveGameData() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(PLAYER_DATA));
}

export function resetGameData() {
  localStorage.removeItem(SAVE_KEY);
  Object.assign(PLAYER_DATA, buildDefaultData());
  PLAYER_DATA.maxStamina = maxStaminaForAccountLevel(PLAYER_DATA.accountLevel);
  PLAYER_DATA.stamina = PLAYER_DATA.maxStamina;
  PLAYER_DATA.lastStaminaUpdate = Date.now();
  saveGameData();
}

/** Sérialise la sauvegarde actuelle en texte JSON, pour export. */
export function exportSaveData() {
  return JSON.stringify(PLAYER_DATA, null, 2);
}

/**
 * Importe une sauvegarde depuis une chaîne JSON (remplace entièrement la
 * partie actuelle après validation). Réutilise toute la logique de
 * migration de loadGameData(), pour rester compatible avec d'anciens
 * exports. Retourne { success: true } ou { success: false, error }.
 */
export function importSaveData(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return { success: false, error: 'Fichier JSON invalide.' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { success: false, error: 'Format de sauvegarde invalide.' };
  }

  const requiredKeys = ['inventory', 'deck', 'gold'];
  const missing = requiredKeys.filter(k => !(k in parsed));
  if (missing.length > 0) {
    return { success: false, error: `Fichier incomplet (champs manquants : ${missing.join(', ')}).` };
  }

  // Écrit le brut dans le stockage puis relit via loadGameData() pour
  // bénéficier de toutes les migrations/valeurs par défaut existantes.
  localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
  const normalized = loadGameData();

  Object.keys(PLAYER_DATA).forEach(key => delete PLAYER_DATA[key]);
  Object.assign(PLAYER_DATA, normalized);
  saveGameData();

  return { success: true };
}

/**
 * Ajoute une unite a l'inventaire sous forme d'instance et retourne celle-ci.
 * Si `equip` est vrai, l'unite est aussi placee dans le deck (si place libre).
 * A utiliser partout ou l'on donnait auparavant une simple cle au joueur
 * (choix du heros de depart, recompenses, etc.).
 */
export function grantUnit(unitKey, equip = false) {
  const instance = createUnitInstance(unitKey);
  PLAYER_DATA.inventory.push(instance);

  if (equip && PLAYER_DATA.deck.length < 5) {
    PLAYER_DATA.deck.push(instance.instanceId);
  }

  return instance;
}

/** Retrouve une instance possedee par son instanceId. */
export function getInstanceById(instanceId) {
  return PLAYER_DATA.inventory.find(inst => inst.instanceId === instanceId);
}

/** Vrai une fois les 42 chapitres de l'Aventure terminés (débloque le Mode Cauchemar). */
export function isAllChaptersCleared() {
  return PLAYER_DATA.unlockedChapter > CHAPTERS_DATABASE.length;
}

// --- Le Reliquaire : objets et fragments ---

export function getItemCount(itemKey) {
  return PLAYER_DATA.items[itemKey] || 0;
}

export function addItem(itemKey, qty = 1) {
  PLAYER_DATA.items[itemKey] = (PLAYER_DATA.items[itemKey] || 0) + qty;
}

/** Dépense qty d'un objet si possible. Retourne false sans rien changer si insuffisant. */
export function spendItem(itemKey, qty = 1) {
  if (getItemCount(itemKey) < qty) return false;
  PLAYER_DATA.items[itemKey] -= qty;
  return true;
}

export function getHeroFragments(unitKey) {
  return PLAYER_DATA.heroFragments[unitKey] || 0;
}

export function addHeroFragments(unitKey, qty = 1) {
  PLAYER_DATA.heroFragments[unitKey] = (PLAYER_DATA.heroFragments[unitKey] || 0) + qty;
}

export function spendHeroFragments(unitKey, qty) {
  if (getHeroFragments(unitKey) < qty) return false;
  PLAYER_DATA.heroFragments[unitKey] -= qty;
  return true;
}

/** Temps restant (ms) avant le prochain reset du Donjon Quotidien. */
export function getDailyDungeonTimeLeft() {
  return Math.max(0, PLAYER_DATA.dailyDungeonResetAt - Date.now());
}

/** Temps restant (ms) avant le prochain reset hebdomadaire de la Tour Sans Fin. */
export function getTowerResetTimeLeft() {
  return Math.max(0, PLAYER_DATA.towerResetAt - Date.now());
}

/** Consomme une tentative du Donjon Quotidien. Retourne false si aucune n'est disponible. */
export function consumeDailyDungeonRun() {
  if (PLAYER_DATA.dailyDungeonRunsLeft <= 0) return false;
  PLAYER_DATA.dailyDungeonRunsLeft -= 1;
  saveGameData();
  return true;
}

/** Les instances actuellement equipees dans le deck, dans l'ordre. */
export function getDeckInstances() {
  return PLAYER_DATA.deck
    .map(id => getInstanceById(id))
    .filter(Boolean);
}

/** Retrouve un Écho Sanguin possédé par son echoId. */
export function getEchoById(echoId) {
  return PLAYER_DATA.echoInventory.find(e => e.echoId === echoId);
}

/** Les Échos actuellement équipés sur une unité donnée (jusqu'à 6). */
export function getEquippedEchoes(instanceId) {
  return PLAYER_DATA.echoInventory.filter(e => e.equippedTo === instanceId);
}

/** Déséquipe tous les Échos d'une unité (à appeler avant de vendre/fusionner cette unité). */
export function unequipEchoesForUnit(instanceId) {
  PLAYER_DATA.echoInventory.forEach(e => {
    if (e.equippedTo === instanceId) e.equippedTo = null;
  });
}

export const PLAYER_DATA = loadGameData();
export { STAMINA_REGEN_INTERVAL };