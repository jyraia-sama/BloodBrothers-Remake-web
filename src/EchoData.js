// ============================================================
//  ÉCHOS SANGUINS — DONNÉES DE RÉFÉRENCE
//  6 emplacements par monstre, chacun avec des règles de
//  statistique principale propres.
// ============================================================

export const ECHO_SLOTS = [
  { id: 1, name: 'Écho du Crâne', short: 'Crâne', mainStatOptions: ['atk_flat'] },
  { id: 2, name: "Écho de l'Artère", short: 'Artère', mainStatOptions: ['atk_flat', 'atk_pct', 'def_flat', 'def_pct', 'hp_flat', 'hp_pct', 'agi_pct'] },
  { id: 3, name: 'Écho de la Plaie', short: 'Plaie', mainStatOptions: ['def_flat'] },
  { id: 4, name: 'Écho du Sacrifice', short: 'Sacrifice', mainStatOptions: ['atk_pct', 'hp_pct', 'def_pct'] },
  { id: 5, name: "Écho de l'Âme", short: 'Âme', mainStatOptions: ['hp_flat'] },
  { id: 6, name: 'Écho du Serment', short: 'Serment', mainStatOptions: ['atk_pct', 'hp_pct', 'def_pct', 'wis_pct'] }
];

export function getSlotById(id) {
  return ECHO_SLOTS.find(s => s.id === id);
}

// Sets à 4 pièces (effets majeurs) et à 2 pièces (effets de complément)
export const ECHO_SETS = {
  violent: { name: 'Violent', pieces: 4, color: 0xcc3322, description: '22% de chance de rejouer un tour après une action.' },
  swift: { name: 'Swift', pieces: 4, color: 0x33ccdd, description: '+25% AGI.' },
  fatal: { name: 'Fatal', pieces: 4, color: 0x881111, description: '+35% ATK.' },
  vampire: { name: 'Vampire', pieces: 4, color: 0x6a1a4a, description: '35% des dégâts infligés sont récupérés en PV.' },
  energy: { name: 'Energy', pieces: 2, color: 0xddaa22, description: '+15% PV.' },
  guard: { name: 'Guard', pieces: 2, color: 0x336699, description: '+15% DEF.' },
  shield: { name: 'Shield', pieces: 2, color: 0xdddd88, description: "Bouclier d'équipe en début de combat (3 tours), basé sur les PV du porteur." }
};

export const ECHO_SET_KEYS = Object.keys(ECHO_SETS);

// Rareté (couleur) -> nombre de substats de départ
export const ECHO_RARITY = {
  normal: { label: 'Normal', color: 0x999999, substats: 0 },
  magique: { label: 'Magique', color: 0x33cc55, substats: 1 },
  rare: { label: 'Rare', color: 0x3399ff, substats: 2 },
  heroique: { label: 'Héroïque', color: 0xaa55ff, substats: 3 },
  legendaire: { label: 'Légendaire', color: 0xff9922, substats: 4 }
};

export const MAX_ECHO_LEVEL = 15;
export const SUBSTAT_MILESTONES = [3, 6, 9, 12];

export const STAT_CATEGORIES = ['atk', 'def', 'hp', 'agi', 'wis'];

export const STAT_LABELS = {
  atk_flat: 'ATK', atk_pct: 'ATK %',
  def_flat: 'DEF', def_pct: 'DEF %',
  hp_flat: 'PV', hp_pct: 'PV %',
  agi_flat: 'AGI', agi_pct: 'AGI %',
  wis_flat: 'WIS', wis_pct: 'WIS %'
};

export function getStatCategory(type) {
  return type.split('_')[0];
}

export function formatStatValue(type, value) {
  return type.endsWith('_pct') ? `+${value}%` : `+${value}`;
}