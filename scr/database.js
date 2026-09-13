export const UNITS_DATABASE = {
  chevalier: { name: 'Chevalier Noir', hp: 1000, maxHp: 1000, atk: 180, def: 120, agi: 100, color: 0x880000, rarity: 'R', skill: { name: 'Coup Dévastateur', chance: 0.3, type: 'damage_single', multiplier: 1.8 } },
  archer: { name: 'Elf Sylvestre', hp: 750, maxHp: 750, atk: 220, def: 80, agi: 150, color: 0x008800, rarity: 'R', skill: { name: 'Pluie de Flèches', chance: 0.35, type: 'damage_aoe', multiplier: 0.7 } },
  mage: { name: 'Sorcier Sombre', hp: 600, maxHp: 600, atk: 280, def: 60, agi: 90, color: 0x440088, rarity: 'SR', skill: { name: 'Soin Obscur', chance: 0.3, type: 'heal_team', power: 200 } },
  clerc: { name: 'Clerc Sacré', hp: 700, maxHp: 700, atk: 120, def: 90, agi: 110, color: 0x00aaff, rarity: 'SR', skill: { name: 'Soin Sacré', chance: 0.4, type: 'heal_lowest', power: 350 } },
  squelette: { name: 'Guerrier Squelette', hp: 800, maxHp: 800, atk: 150, def: 90, agi: 110, color: 0x888888, rarity: 'N', skill: { name: 'Cri d\'Effroi', chance: 0.25, type: 'buff_atk', amount: 30 } },
  demon_inf: { name: 'Gardiens d\'Ombre', hp: 1200, maxHp: 1200, atk: 240, def: 110, agi: 120, color: 0x660022, rarity: 'SR', skill: { name: 'Frappe Maudite', chance: 0.3, type: 'damage_single', multiplier: 1.5 } },
  boss: { name: 'Seigneur Démon', hp: 2500, maxHp: 2500, atk: 350, def: 180, agi: 130, color: 0xaa00aa, rarity: 'SSR', skill: { name: 'Cataclysme', chance: 0.4, type: 'damage_aoe', multiplier: 1.2 } }
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