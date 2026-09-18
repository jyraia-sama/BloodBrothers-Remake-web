import { createUnitInstance, maxStaminaForAccountLevel } from './levelSystem.js';

const SAVE_KEY = 'BLOOD_BROTHERS_SAVE_V2';
const STAMINA_REGEN_INTERVAL = 5 * 60 * 1000;

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
    deck: starters.map(inst => inst.instanceId)   // tableau d'instanceId
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

/** Les instances actuellement equipees dans le deck, dans l'ordre. */
export function getDeckInstances() {
  return PLAYER_DATA.deck
    .map(id => getInstanceById(id))
    .filter(Boolean);
}

export const PLAYER_DATA = loadGameData();
export { STAMINA_REGEN_INTERVAL };