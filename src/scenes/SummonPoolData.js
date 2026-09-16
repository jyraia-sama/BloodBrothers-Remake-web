export const SUMMON_POOL_DATABASE = {

  // ============================================================
  //  UNITÉS D'ORIGINE (clés conservées telles quelles - utilisées
  //  ailleurs dans le code : deck par défaut, enemyPool, bossUnit)
  // ============================================================
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
    hp: 2500, maxHp: 2500, atk: 250, def: 180, agi: 130, wis: 180,
    color: 0xaa00aa, rarity: 'SSR',
    skill: { name: 'Cataclysme', chance: 0.4, type: 'damage_aoe', multiplier: 1.2 }
  },

  // ============================================================
  //  RARETÉ N (Commun) — 17 nouveaux
  // ============================================================
  rat_geant: {
    name: 'Rat Géant', hp: 500, maxHp: 500, atk: 90, def: 50, agi: 100, wis: 15,
    color: 0x5a4a3a, rarity: 'N',
    skill: { name: 'Morsure Enragée', chance: 0.3, type: 'damage_single', multiplier: 1.4 }
  },
  gobelin: {
    name: 'Gobelin Pillard', hp: 520, maxHp: 520, atk: 105, def: 55, agi: 95, wis: 20,
    color: 0x3d6b2b, rarity: 'N',
    skill: { name: 'Coup Sournois', chance: 0.3, type: 'damage_single', multiplier: 1.5 }
  },
  loup_gris: {
    name: 'Loup Gris', hp: 560, maxHp: 560, atk: 120, def: 60, agi: 130, wis: 25,
    color: 0x6d6d6d, rarity: 'N',
    skill: { name: 'Hurlement de Meute', chance: 0.25, type: 'buff_atk', amount: 25 }
  },
  zombie: {
    name: 'Zombie Errant', hp: 680, maxHp: 680, atk: 95, def: 65, agi: 65, wis: 15,
    color: 0x4a5a3a, rarity: 'N',
    skill: { name: 'Étreinte Putride', chance: 0.25, type: 'damage_single', multiplier: 1.3 }
  },
  bandit: {
    name: 'Bandit des Routes', hp: 550, maxHp: 550, atk: 115, def: 60, agi: 110, wis: 30,
    color: 0x704214, rarity: 'N',
    skill: { name: 'Attaque Rapide', chance: 0.3, type: 'damage_single', multiplier: 1.4 }
  },
  araignee_venin: {
    name: 'Araignée Venimeuse', hp: 500, maxHp: 500, atk: 110, def: 45, agi: 120, wis: 35,
    color: 0x2b1a3a, rarity: 'N',
    skill: { name: 'Crachat Toxique', chance: 0.3, type: 'damage_aoe', multiplier: 0.6 }
  },
  chauve_souris_vampire: {
    name: 'Chauve-Souris Nocturne', hp: 480, maxHp: 480, atk: 100, def: 40, agi: 140, wis: 30,
    color: 0x3a1a3a, rarity: 'N',
    skill: { name: 'Vol Erratique', chance: 0.25, type: 'damage_single', multiplier: 1.3 }
  },
  limace_acide: {
    name: 'Limace Acide', hp: 600, maxHp: 600, atk: 85, def: 80, agi: 65, wis: 20,
    color: 0x6bbf3a, rarity: 'N',
    skill: { name: 'Projection Acide', chance: 0.25, type: 'damage_aoe', multiplier: 0.55 }
  },
  corbeau_maudit: {
    name: 'Corbeau Maudit', hp: 490, maxHp: 490, atk: 105, def: 45, agi: 135, wis: 40,
    color: 0x1a1a1a, rarity: 'N',
    skill: { name: 'Bec Perçant', chance: 0.3, type: 'damage_single', multiplier: 1.4 }
  },
  sanglier_sauvage: {
    name: 'Sanglier Sauvage', hp: 650, maxHp: 650, atk: 125, def: 70, agi: 80, wis: 15,
    color: 0x4a2a1a, rarity: 'N',
    skill: { name: 'Charge Brutale', chance: 0.3, type: 'damage_single', multiplier: 1.5 }
  },
  brigand: {
    name: 'Brigand Ivre', hp: 570, maxHp: 570, atk: 118, def: 58, agi: 105, wis: 25,
    color: 0x8a5a2a, rarity: 'N',
    skill: { name: 'Coup de Gourdin', chance: 0.3, type: 'damage_single', multiplier: 1.4 }
  },
  slime: {
    name: 'Slime Gélatineux', hp: 620, maxHp: 620, atk: 80, def: 85, agi: 55, wis: 20,
    color: 0x3aa8bf, rarity: 'N',
    skill: { name: 'Absorption', chance: 0.25, type: 'heal_team', power: 100 }
  },
  hyene_des_sables: {
    name: 'Hyène des Sables', hp: 540, maxHp: 540, atk: 122, def: 55, agi: 125, wis: 20,
    color: 0xc2a15c, rarity: 'N',
    skill: { name: 'Ricanement', chance: 0.25, type: 'buff_atk', amount: 20 }
  },
  serpent_crache: {
    name: 'Serpent Cracheur', hp: 500, maxHp: 500, atk: 112, def: 48, agi: 115, wis: 35,
    color: 0x2a7a2a, rarity: 'N',
    skill: { name: 'Jet de Venin', chance: 0.3, type: 'damage_single', multiplier: 1.4 }
  },
  moine_dechu: {
    name: 'Moine Déchu', hp: 620, maxHp: 620, atk: 100, def: 75, agi: 90, wis: 60,
    color: 0x5a3a1a, rarity: 'N',
    skill: { name: 'Prière Brisée', chance: 0.25, type: 'heal_lowest', power: 150 }
  },
  vautour_charognard: {
    name: 'Vautour Charognard', hp: 510, maxHp: 510, atk: 108, def: 50, agi: 130, wis: 25,
    color: 0x5a4a3a, rarity: 'N',
    skill: { name: 'Piqué Mortel', chance: 0.3, type: 'damage_single', multiplier: 1.45 }
  },
  esprit_frappeur: {
    name: 'Esprit Frappeur', hp: 470, maxHp: 470, atk: 115, def: 40, agi: 110, wis: 65,
    color: 0x9a9aff, rarity: 'N',
    skill: { name: 'Frappe Spectrale', chance: 0.3, type: 'damage_single', multiplier: 1.45 }
  },

  // ============================================================
  //  RARETÉ R (Rare) — 14 nouveaux
  // ============================================================
  orc_guerrier: {
    name: 'Orc Guerrier', hp: 780, maxHp: 780, atk: 150, def: 95, agi: 100, wis: 40,
    color: 0x4a6b2a, rarity: 'R',
    skill: { name: 'Fureur Verte', chance: 0.3, type: 'buff_atk', amount: 35 }
  },
  loup_garou: {
    name: 'Loup-Garou', hp: 820, maxHp: 820, atk: 175, def: 90, agi: 155, wis: 45,
    color: 0x3a3a3a, rarity: 'R',
    skill: { name: 'Griffes de Lune', chance: 0.35, type: 'damage_single', multiplier: 1.7 }
  },
  spectre_glacial: {
    name: 'Spectre Glacial', hp: 720, maxHp: 720, atk: 165, def: 85, agi: 135, wis: 90,
    color: 0x6ab8e0, rarity: 'R',
    skill: { name: 'Souffle Gelé', chance: 0.3, type: 'damage_aoe', multiplier: 0.75 }
  },
  golem_pierre: {
    name: 'Golem de Pierre', hp: 900, maxHp: 900, atk: 140, def: 130, agi: 60, wis: 50,
    color: 0x7a7a6a, rarity: 'R',
    skill: { name: 'Poing de Roc', chance: 0.3, type: 'damage_single', multiplier: 1.6 }
  },
  harpie: {
    name: 'Harpie Hurlante', hp: 700, maxHp: 700, atk: 170, def: 75, agi: 160, wis: 55,
    color: 0xb08a3a, rarity: 'R',
    skill: { name: 'Cri Strident', chance: 0.3, type: 'buff_atk', amount: 30 }
  },
  chevalier_rouille: {
    name: 'Chevalier Rouillé', hp: 850, maxHp: 850, atk: 155, def: 120, agi: 90, wis: 35,
    color: 0x8a4a2a, rarity: 'R',
    skill: { name: 'Charge Blindée', chance: 0.3, type: 'damage_single', multiplier: 1.65 }
  },
  sorciere_bois: {
    name: 'Sorcière des Bois', hp: 680, maxHp: 680, atk: 160, def: 70, agi: 110, wis: 130,
    color: 0x2a5a2a, rarity: 'R',
    skill: { name: 'Rituel Sylvestre', chance: 0.35, type: 'heal_team', power: 220 }
  },
  troll_marais: {
    name: 'Troll des Marais', hp: 880, maxHp: 880, atk: 168, def: 110, agi: 75, wis: 45,
    color: 0x4a5a3a, rarity: 'R',
    skill: { name: 'Régénération', chance: 0.3, type: 'heal_lowest', power: 250 }
  },
  gargouille: {
    name: 'Gargouille Ailée', hp: 790, maxHp: 790, atk: 145, def: 125, agi: 100, wis: 60,
    color: 0x5a5a5a, rarity: 'R',
    skill: { name: 'Plongeon de Pierre', chance: 0.3, type: 'damage_single', multiplier: 1.6 }
  },
  assassin_ombre: {
    name: 'Assassin de l\'Ombre', hp: 690, maxHp: 690, atk: 185, def: 70, agi: 170, wis: 50,
    color: 0x1a1a2a, rarity: 'R',
    skill: { name: 'Coup Fatal', chance: 0.35, type: 'damage_single', multiplier: 1.8 }
  },
  cyclope: {
    name: 'Cyclope Borgne', hp: 900, maxHp: 900, atk: 175, def: 100, agi: 70, wis: 30,
    color: 0x8a6a3a, rarity: 'R',
    skill: { name: 'Écrasement', chance: 0.3, type: 'damage_aoe', multiplier: 0.8 }
  },
  minotaure_jeune: {
    name: 'Jeune Minotaure', hp: 850, maxHp: 850, atk: 180, def: 95, agi: 105, wis: 40,
    color: 0x6b3a1a, rarity: 'R',
    skill: { name: 'Charge du Labyrinthe', chance: 0.3, type: 'damage_single', multiplier: 1.7 }
  },
  banshee: {
    name: 'Banshee Pleureuse', hp: 660, maxHp: 660, atk: 172, def: 65, agi: 140, wis: 95,
    color: 0xc0c0e0, rarity: 'R',
    skill: { name: 'Lamento Mortel', chance: 0.35, type: 'damage_aoe', multiplier: 0.8 }
  },
  centaure_guerrier: {
    name: 'Centaure Guerrier', hp: 820, maxHp: 820, atk: 165, def: 105, agi: 150, wis: 55,
    color: 0x7a5a3a, rarity: 'R',
    skill: { name: 'Tir au Galop', chance: 0.3, type: 'damage_single', multiplier: 1.65 }
  },

  // ============================================================
  //  RARETÉ SR (Super Rare) — 8 nouveaux
  // ============================================================
  golem_obsidienne: {
    name: 'Golem d\'Obsidienne', hp: 1100, maxHp: 1100, atk: 220, def: 170, agi: 80, wis: 90,
    color: 0x1a1a1a, rarity: 'SR',
    skill: { name: 'Éclat Tranchant', chance: 0.3, type: 'damage_single', multiplier: 1.9 }
  },
  liche_mineure: {
    name: 'Liche Mineure', hp: 950, maxHp: 950, atk: 250, def: 120, agi: 130, wis: 160,
    color: 0x2a6a4a, rarity: 'SR',
    skill: { name: 'Drain de Vie', chance: 0.35, type: 'heal_team', power: 260 }
  },
  chimere: {
    name: 'Chimère Enragée', hp: 1050, maxHp: 1050, atk: 240, def: 140, agi: 150, wis: 100,
    color: 0x8a3a3a, rarity: 'SR',
    skill: { name: 'Triple Assaut', chance: 0.35, type: 'damage_aoe', multiplier: 0.95 }
  },
  seraphin_dechu: {
    name: 'Séraphin Déchu', hp: 1000, maxHp: 1000, atk: 245, def: 130, agi: 160, wis: 150,
    color: 0x3a1a4a, rarity: 'SR',
    skill: { name: 'Jugement Sombre', chance: 0.35, type: 'damage_single', multiplier: 2.0 }
  },
  hydre_jeune: {
    name: 'Jeune Hydre', hp: 1150, maxHp: 1150, atk: 230, def: 150, agi: 110, wis: 90,
    color: 0x2a6a2a, rarity: 'SR',
    skill: { name: 'Morsures Multiples', chance: 0.35, type: 'damage_aoe', multiplier: 1.0 }
  },
  demon_flamme: {
    name: 'Démon de Flamme', hp: 980, maxHp: 980, atk: 260, def: 125, agi: 140, wis: 110,
    color: 0xcc4400, rarity: 'SR',
    skill: { name: 'Explosion Infernale', chance: 0.3, type: 'damage_aoe', multiplier: 1.05 }
  },
  reine_araignee: {
    name: 'Reine Araignée', hp: 920, maxHp: 920, atk: 235, def: 115, agi: 155, wis: 120,
    color: 0x4a1a5a, rarity: 'SR',
    skill: { name: 'Toile Mortelle', chance: 0.35, type: 'damage_single', multiplier: 1.95 }
  },
  wyverne: {
    name: 'Wyverne Sauvage', hp: 1080, maxHp: 1080, atk: 255, def: 145, agi: 165, wis: 95,
    color: 0x3a6a8a, rarity: 'SR',
    skill: { name: 'Piqué Venimeux', chance: 0.3, type: 'damage_single', multiplier: 2.0 }
  },

  // ============================================================
  //  RARETÉ SSR (Ultra Rare) — 4 nouveaux
  // ============================================================
  dragon_ombre: {
    name: 'Dragon d\'Ombre', hp: 1450, maxHp: 1450, atk: 300, def: 190, agi: 180, wis: 160,
    color: 0x1a0a2a, rarity: 'SSR',
    skill: { name: 'Souffle Ténébreux', chance: 0.35, type: 'damage_aoe', multiplier: 1.15 }
  },
  archange_noir: {
    name: 'Archange Noir', hp: 1300, maxHp: 1300, atk: 290, def: 200, agi: 200, wis: 210,
    color: 0x0a0a1a, rarity: 'SSR',
    skill: { name: 'Châtiment Céleste', chance: 0.35, type: 'damage_single', multiplier: 2.2 }
  },
  titan_abysses: {
    name: 'Titan des Abysses', hp: 1600, maxHp: 1600, atk: 280, def: 230, agi: 160, wis: 140,
    color: 0x0a2a3a, rarity: 'SSR',
    skill: { name: 'Raz-de-Marée', chance: 0.3, type: 'damage_aoe', multiplier: 1.1 }
  },
  reine_liches: {
    name: 'Reine des Liches', hp: 1350, maxHp: 1350, atk: 310, def: 180, agi: 170, wis: 220,
    color: 0x2a0a3a, rarity: 'SSR',
    skill: { name: 'Résurrection Noire', chance: 0.4, type: 'heal_team', power: 400 }
  }
};