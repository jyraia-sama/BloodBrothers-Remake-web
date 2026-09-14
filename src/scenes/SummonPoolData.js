export const SUMMON_POOL_DATABASE = {
  chevalier: { 
    name: 'Chevalier Noir', 
    hp: 1000, maxHp: 1000, atk: 180, def: 120, agi: 100, wis: 40, 
    color: 0x880000, rarity: 'R', 
    skill: { name: 'Coup Dévastateur', chance: 0.3, type: 'damage_single', multiplier: 1.8 } 
  },
  archer: { 
    name: 'Elf Sylvestre', 
    hp: 750, maxHp: 750, atk: 220, def: 80, agi: 150, wis: 80, 
    color: 0x008800, rarity: 'R', 
    skill: { name: 'Pluie de Flèches', chance: 0.35, type: 'damage_aoe', multiplier: 0.7 } 
  },
  mage: { 
    name: 'Sorcier Sombre', 
    hp: 600, maxHp: 600, atk: 280, def: 60, agi: 90, wis: 200, 
    color: 0x440088, rarity: 'SR', 
    skill: { name: 'Soin Obscur', chance: 0.3, type: 'heal_team', power: 200 } 
  },
  clerc: { 
    name: 'Clerc Sacré', 
    hp: 700, maxHp: 700, atk: 120, def: 90, agi: 110, wis: 230, 
    color: 0x00aaff, rarity: 'SR', 
    skill: { name: 'Soin Sacré', chance: 0.4, type: 'heal_lowest', power: 350 } 
  },
  squelette: { 
    name: 'Guerrier Squelette', 
    hp: 800, maxHp: 800, atk: 150, def: 90, agi: 110, wis: 30, 
    color: 0x888888, rarity: 'N', 
    skill: { name: 'Cri d\'Effroi', chance: 0.25, type: 'buff_atk', amount: 30 } 
  },
  demon_inf: { 
    name: 'Gardiens d\'Ombre', 
    hp: 1200, maxHp: 1200, atk: 240, def: 110, agi: 120, wis: 100, 
    color: 0x660022, rarity: 'SR', 
    skill: { name: 'Frappe Maudite', chance: 0.3, type: 'damage_single', multiplier: 1.5 } 
  },
  boss: { 
    name: 'Seigneur Démon', 
    hp: 2500, maxHp: 2500, atk: 350, def: 180, agi: 130, wis: 180, 
    color: 0xaa00aa, rarity: 'SSR', 
    skill: { name: 'Cataclysme', chance: 0.4, type: 'damage_aoe', multiplier: 1.2 } 
  }
};