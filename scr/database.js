export const EQUIPMENT_DATABASE = {
  // ARMES
  epee_bois: { name: 'Épée en bois', type: 'weapon', rarity: 'Commun', bonusType: 'atk', bonusValue: 20, color: 0x888888 },
  epee_fer: { name: 'Épée de Fer', type: 'weapon', rarity: 'Rare', bonusType: 'atk', bonusValue: 50, color: 0x2266cc },
  lame_feu: { name: 'Lame ardente', type: 'weapon', rarity: 'Épique', bonusType: 'atk_pct', bonusValue: 0.15, color: 0xaa2299 },
  excalibur: { name: 'Excalibur', type: 'weapon', rarity: 'Légendaire', bonusType: 'atk_pct', bonusValue: 0.30, color: 0xffaa00 },

  // ARMURES
  armure_cuir: { name: 'Armure en cuir', type: 'armor', rarity: 'Commun', bonusType: 'def', bonusValue: 15, color: 0x888888 },
  cote_maille: { name: 'Côte de mailles', type: 'armor', rarity: 'Rare', bonusType: 'def', bonusValue: 40, color: 0x2266cc },
  plaque_acier: { name: 'Harnais d\'acier', type: 'armor', rarity: 'Épique', bonusType: 'def_pct', bonusValue: 0.15, color: 0xaa2299 },
  egide_sacre: { name: 'Égide Céleste', type: 'armor', rarity: 'Légendaire', bonusType: 'def_pct', bonusValue: 0.30, color: 0xffaa00 },

  // RELIQUES
  anneau_vie: { name: 'Anneau de vie', type: 'relic', rarity: 'Commun', bonusType: 'hp', bonusValue: 100, color: 0x888888 },
  amulette_vitesse: { name: 'Amulette Agile', type: 'relic', rarity: 'Rare', bonusType: 'agi', bonusValue: 30, color: 0x2266cc },
  orbe_critique: { name: 'Orbe de Critique', type: 'relic', rarity: 'Épique', bonusType: 'crit', bonusValue: 0.05, color: 0xaa2299 },
  couronne_roi: { name: 'Couronne Royale', type: 'relic', rarity: 'Légendaire', bonusType: 'all_pct', bonusValue: 0.10, color: 0xffaa00 }
};

export const HEROES_DATABASE = {
  brute_noire: { name: 'La Brute Noire', race: 'Gorille', level: 1, maxLevel: 10, hp: 1400, maxHp: 1400, atk: 320, def: 110, agi: 60, color: 0x222222, rarity: 'SSR', skill: { name: 'Frappe Brutale', chance: 0.35, type: 'damage_single', multiplier: 2.0 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } },
  barbe_bleue: { name: 'Barbe Bleue', race: 'Nain', level: 1, maxLevel: 10, hp: 1200, maxHp: 1200, atk: 160, def: 240, agi: 80, color: 0x114488, rarity: 'SSR', skill: { name: 'Bouclier Magique', chance: 0.4, type: 'heal_team', power: 250 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } },
  lance_doree: { name: 'La Lance Dorée', race: 'Homme-Lézard', level: 1, maxLevel: 10, hp: 900, maxHp: 900, atk: 220, def: 90, agi: 260, color: 0xddaa00, rarity: 'SSR', skill: { name: 'Estoc Éclair', chance: 0.35, type: 'damage_single', multiplier: 1.7 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } },
  nymphe: { name: 'La Nymphe', race: 'Elfe', level: 1, maxLevel: 10, hp: 950, maxHp: 950, atk: 150, def: 200, agi: 110, color: 0x22aa55, rarity: 'SSR', skill: { name: 'Soin Sacré', chance: 0.4, type: 'heal_lowest', power: 400 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } },
  mage_gris: { name: 'Le Mage Gris', race: 'Gobelin', level: 1, maxLevel: 10, hp: 800, maxHp: 800, atk: 260, def: 70, agi: 220, color: 0x777788, rarity: 'SSR', skill: { name: 'Explosion Magique', chance: 0.3, type: 'damage_aoe', multiplier: 1.1 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } },
  dague_violette: { name: 'La Dague Violette', race: 'Elfe Sombre', level: 1, maxLevel: 10, hp: 850, maxHp: 850, atk: 290, def: 80, agi: 180, color: 0x660099, rarity: 'SSR', skill: { name: 'Lame d\'Ombre', chance: 0.35, type: 'damage_single', multiplier: 1.9 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } },
  samourai_rouge: { name: 'Le Samouraï Rouge', race: 'Humain', level: 1, maxLevel: 10, hp: 1000, maxHp: 1000, atk: 280, def: 100, agi: 200, color: 0xcc1111, rarity: 'SSR', skill: { name: 'Entaille Rapide', chance: 0.35, type: 'damage_single', multiplier: 1.8 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } },
  chevalier_blanc: { name: 'Le Chevalier Blanc', race: 'Humain', level: 1, maxLevel: 10, hp: 1250, maxHp: 1250, atk: 250, def: 220, agi: 90, color: 0xeeeeee, rarity: 'SSR', skill: { name: 'Charge Sainte', chance: 0.3, type: 'damage_single', multiplier: 1.6 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } }
};

export const UNITS_DATABASE = {
  ...HEROES_DATABASE,
  squelette: { name: 'Guerrier Squelette', level: 1, maxLevel: 5, hp: 800, maxHp: 800, atk: 150, def: 90, agi: 110, color: 0x888888, rarity: 'N', skill: { name: 'Cri d\'Effroi', chance: 0.25, type: 'buff_atk', amount: 30 }, evolutionTarget: 'squelette_elite', equipment: { weapon: null, armor: null, relic: null } },
  squelette_elite: { name: 'Seigneur Squelette', level: 1, maxLevel: 10, hp: 1200, maxHp: 1200, atk: 220, def: 130, agi: 130, color: 0xaaaaaa, rarity: 'R', skill: { name: 'Cri Dévastateur', chance: 0.3, type: 'buff_atk', amount: 60 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } },
  archer: { name: 'Elf Sylvestre', level: 1, maxLevel: 5, hp: 750, maxHp: 750, atk: 220, def: 80, agi: 150, color: 0x008800, rarity: 'R', skill: { name: 'Pluie de Flèches', chance: 0.35, type: 'damage_aoe', multiplier: 0.7 }, evolutionTarget: 'archer_elite', equipment: { weapon: null, armor: null, relic: null } },
  archer_elite: { name: 'Maître Archer Sylvestre', level: 1, maxLevel: 10, hp: 1100, maxHp: 1100, atk: 310, def: 110, agi: 200, color: 0x00cc00, rarity: 'SR', skill: { name: 'Deluge de Flèches', chance: 0.4, type: 'damage_aoe', multiplier: 1.0 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } },
  mage: { name: 'Sorcier Sombre', level: 1, maxLevel: 5, hp: 600, maxHp: 600, atk: 280, def: 60, agi: 90, color: 0x440088, rarity: 'SR', skill: { name: 'Soin Obscur', chance: 0.3, type: 'heal_team', power: 200 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } },
  clerc: { name: 'Clerc Sacré', level: 1, maxLevel: 5, hp: 700, maxHp: 700, atk: 120, def: 90, agi: 110, color: 0x00aaff, rarity: 'SR', skill: { name: 'Soin Sacré', chance: 0.4, type: 'heal_lowest', power: 350 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } },
  demon_inf: { name: 'Gardien d\'Ombre', level: 1, maxLevel: 5, hp: 1200, maxHp: 1200, atk: 240, def: 110, agi: 120, color: 0x660022, rarity: 'SR', skill: { name: 'Frappe Maudite', chance: 0.3, type: 'damage_single', multiplier: 1.5 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } },
  boss: { name: 'Seigneur Démon', level: 1, maxLevel: 10, hp: 2500, maxHp: 2500, atk: 350, def: 180, agi: 130, color: 0xaa00aa, rarity: 'SSR', skill: { name: 'Cataclysme', chance: 0.4, type: 'damage_aoe', multiplier: 1.2 }, evolutionTarget: null, equipment: { weapon: null, armor: null, relic: null } }
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