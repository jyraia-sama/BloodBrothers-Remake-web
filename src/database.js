import { SUMMON_POOL_DATABASE } from './scenes/SummonPoolData.js';

export const HEROES_DATABASE = {
  brute_noire: { name: 'La Brute Noire', race: 'Gorille', hp: 1400, maxHp: 1400, atk: 320, def: 110, agi: 60, wis: 50, color: 0x222222, rarity: 'SSR', skill: { name: 'Frappe Brutale', chance: 0.35, type: 'damage_single', multiplier: 2.0 } },
  barbe_bleue: { name: 'Barbe Bleue', race: 'Nain', hp: 1200, maxHp: 1200, atk: 160, def: 240, agi: 80, wis: 150, color: 0x114488, rarity: 'SSR', skill: { name: 'Bouclier Magique', chance: 0.4, type: 'heal_team', power: 250 } },
  lance_doree: { name: 'La Lance Dorée', race: 'Homme-Lézard', hp: 900, maxHp: 900, atk: 220, def: 90, agi: 260, wis: 70, color: 0xddaa00, rarity: 'SSR', skill: { name: 'Estoc Éclair', chance: 0.35, type: 'damage_single', multiplier: 1.7 } },
  nymphe: { name: 'La Nymphe', race: 'Elfe', hp: 950, maxHp: 950, atk: 150, def: 200, agi: 110, wis: 220, color: 0x22aa55, rarity: 'SSR', skill: { name: 'Soin Sacré', chance: 0.4, type: 'heal_lowest', power: 400 } },
  mage_gris: { name: 'Le Mage Gris', race: 'Gobelin', hp: 800, maxHp: 800, atk: 260, def: 70, agi: 220, wis: 250, color: 0x777788, rarity: 'SSR', skill: { name: 'Explosion Magique', chance: 0.3, type: 'damage_aoe', multiplier: 1.1 } },
  dague_violette: { name: 'La Dague Violette', race: 'Elfe Sombre', hp: 850, maxHp: 850, atk: 290, def: 80, agi: 180, wis: 90, color: 0x660099, rarity: 'SSR', skill: { name: 'Lame d\'Ombre', chance: 0.35, type: 'damage_single', multiplier: 1.9 } },
  samourai_rouge: { name: 'Le Samouraï Rouge', race: 'Humain', hp: 1000, maxHp: 1000, atk: 280, def: 100, agi: 200, wis: 60, color: 0xcc1111, rarity: 'SSR', skill: { name: 'Entaille Rapide', chance: 0.35, type: 'damage_single', multiplier: 1.8 } },
  chevalier_blanc: { name: 'Le Chevalier Blanc', race: 'Humain', hp: 1250, maxHp: 1250, atk: 250, def: 220, agi: 90, wis: 100, color: 0xeeeeee, rarity: 'SSR', skill: { name: 'Charge Sainte', chance: 0.3, type: 'damage_single', multiplier: 1.6 } }
};

export const UNITS_DATABASE = {
  ...HEROES_DATABASE,
  ...SUMMON_POOL_DATABASE
};

export const CHAPTERS_DATABASE = [
  {
    id: 1,
    title: 'Chapitre 1 : La Forêt Sombre',
    bgColor: 0x112211,
    enemyPool: ['squelette'],
    bossUnit: 'boss',
    rewardGold: 100,
    tiles: [
      { id: 0, type: 'start', label: 'Départ', color: 0x333344 },
      { id: 1, type: 'gold', label: 'Trésor', color: 0xddaa00 },
      { id: 2, type: 'battle', label: 'Ennemi', color: 0xaa2222 },
      { id: 3, type: 'heal', label: 'Fontaine', color: 0x22aa22 },
      { id: 4, type: 'battle', label: 'Ennemi', color: 0xaa2222 },
      { id: 5, type: 'boss', label: 'BOSS', color: 0x8800aa }
    ]
  },
  {
    id: 2,
    title: 'Chapitre 2 : Le Donjon Maudit',
    bgColor: 0x221122,
    enemyPool: ['squelette', 'demon_inf'],
    bossUnit: 'boss',
    rewardGold: 250,
    tiles: [
      { id: 0, type: 'start', label: 'Départ', color: 0x333344 },
      { id: 1, type: 'battle', label: 'Ennemi', color: 0xaa2222 },
      { id: 2, type: 'gold', label: 'Coffre', color: 0xddaa00 },
      { id: 3, type: 'battle', label: 'Ennemi', color: 0xaa2222 },
      { id: 4, type: 'heal', label: 'Fontaine', color: 0x22aa22 },
      { id: 5, type: 'battle', label: 'Élite', color: 0xaa2222 },
      { id: 6, type: 'boss', label: 'BOSS', color: 0x8800aa }
    ]
  },
  {
    id: 3,
    title: 'Chapitre 3 : Le Cratère Volcanique',
    bgColor: 0x331111,
    enemyPool: ['demon_inf'],
    bossUnit: 'boss',
    rewardGold: 500,
    tiles: [
      { id: 0, type: 'start', label: 'Départ', color: 0x333344 },
      { id: 1, type: 'battle', label: 'Ennemi', color: 0xaa2222 },
      { id: 2, type: 'battle', label: 'Ennemi', color: 0xaa2222 },
      { id: 3, type: 'gold', label: 'Trésor', color: 0xddaa00 },
      { id: 4, type: 'battle', label: 'Garde', color: 0xaa2222 },
      { id: 5, type: 'heal', label: 'Fontaine', color: 0x22aa22 },
      { id: 6, type: 'battle', label: 'Élite', color: 0xaa2222 },
      { id: 7, type: 'boss', label: 'BOSS', color: 0x8800aa }
    ]
  }
];