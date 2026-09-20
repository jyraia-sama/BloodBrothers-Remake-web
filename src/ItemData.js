// ============================================================
//  LE RELIQUAIRE — DONNÉES DE RÉFÉRENCE
//  Objets consommables et monnaies d'appoint qui donnent un
//  objectif de farm au-delà du pur hasard.
// ============================================================

export const ITEMS = {
  echo_dust: {
    name: "Poussière d'Écho", icon: '✨', color: 0x9966cc,
    description: "Obtenue en désenchantant un Écho non désiré. Sert à fabriquer un Écho garanti à l'Atelier."
  },
  reforge_stone: {
    name: 'Pierre de Reforge', icon: '💎', color: 0x33aadd,
    description: "Reroll une substat au choix sur un Écho déjà équipé (depuis sa fiche détail)."
  },
  lock_seal: {
    name: 'Sceau de Verrouillage', icon: '🔒', color: 0xdddd44,
    description: "Protège une substat lors de la prochaine amélioration d'un Écho (depuis sa fiche détail)."
  },
  pact_ticket: {
    name: 'Billet de Pacte', icon: '🎫', color: 0xff8844,
    description: "Une invocation gratuite au Pacte Doré (depuis l'Autel d'Invocation)."
  },
  xp_tome: {
    name: "Tome d'XP", icon: '📘', color: 0x4488ff,
    description: "Accorde instantanément de l'XP à une carte au choix (depuis la Gestion du Deck)."
  },
  stamina_elixir: {
    name: 'Élixir de Stamina', icon: '🧪', color: 0x44dd88,
    description: 'Restaure votre Stamina au maximum, instantanément.'
  },
  loot_chest_key: {
    name: 'Clé de Coffre', icon: '🗝️', color: 0xccaa44,
    description: 'Accumulez-en pour ouvrir un Coffre de Butin (Or, Écho, Éclat).'
  }
};

export const ITEM_KEYS = Object.keys(ITEMS);

export const SET_ESSENCE_PREFIX = 'set_essence_';
export function getSetEssenceKey(setKey) {
  return `${SET_ESSENCE_PREFIX}${setKey}`;
}
export function isSetEssenceKey(key) {
  return key.startsWith(SET_ESSENCE_PREFIX);
}
export function getSetKeyFromEssence(essenceKey) {
  return essenceKey.slice(SET_ESSENCE_PREFIX.length);
}

// --- Constantes d'équilibrage ---
export const XP_TOME_AMOUNT = 500;
export const FRAGMENTS_REQUIRED = 20;
export const CHEST_KEYS_REQUIRED = 5;
export const ATELIER_DUST_COST = 150;
export const ESSENCE_EXCHANGE_COST = 30;