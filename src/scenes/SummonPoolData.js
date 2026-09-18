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
    hp: 2500, maxHp: 2500, atk: 350, def: 180, agi: 130, wis: 180,
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
  },

  // ============================================================
  //  RARETÉ UR (Ultra Rare) — 3 monstres, exclusifs au Pacte Supérieur
  // ============================================================
  phenix_immortel: {
    name: 'Phénix Immortel', hp: 1800, maxHp: 1800, atk: 360, def: 230, agi: 260, wis: 240,
    color: 0xff6600, rarity: 'UR',
    skill: { name: 'Renaissance Ardente', chance: 0.4, type: 'heal_team', power: 500 }
  },
  leviathan_abyssal: {
    name: 'Léviathan Abyssal', hp: 2000, maxHp: 2000, atk: 380, def: 260, agi: 200, wis: 220,
    color: 0x003355, rarity: 'UR',
    skill: { name: 'Raz-de-Marée Titanesque', chance: 0.35, type: 'damage_aoe', multiplier: 1.3 }
  },
  empereur_dechu: {
    name: 'Empereur Déchu', hp: 1750, maxHp: 1750, atk: 400, def: 240, agi: 230, wis: 200,
    color: 0x330011, rarity: 'UR',
    skill: { name: 'Édit de Destruction', chance: 0.4, type: 'damage_single', multiplier: 2.5 }
  },

  // ============================================================
  //  ENNEMIS EXCLUSIFS AUX COMBATS (non invocables par le joueur)
  //  Répartis en 6 paliers de difficulté sur les 24 chapitres.
  // ============================================================

  // --- Palier 1 (chapitres 1-4) ---
  gobelin_maraudeur: {
    name: 'Gobelin Maraudeur', hp: 580, maxHp: 580, atk: 110, def: 60, agi: 95, wis: 25,
    color: 0x3d6b2b, rarity: 'N',
    skill: { name: 'Pillage Rapide', chance: 0.28, type: 'damage_single', multiplier: 1.3 }
  },
  loup_affame: {
    name: 'Loup Affamé', hp: 600, maxHp: 600, atk: 120, def: 55, agi: 105, wis: 20,
    color: 0x555555, rarity: 'N',
    skill: { name: 'Morsure Vorace', chance: 0.3, type: 'damage_single', multiplier: 1.35 }
  },
  rat_corrompu: {
    name: 'Rat Corrompu', hp: 560, maxHp: 560, atk: 100, def: 50, agi: 100, wis: 20,
    color: 0x4a3a2a, rarity: 'N',
    skill: { name: 'Fièvre Rampante', chance: 0.25, type: 'damage_aoe', multiplier: 0.5 }
  },

  // --- Palier 2 (chapitres 5-8) ---
  zombie_enrage: {
    name: 'Zombie Enragé', hp: 760, maxHp: 760, atk: 150, def: 95, agi: 100, wis: 40,
    color: 0x4a5a2a, rarity: 'R',
    skill: { name: 'Assaut Putride', chance: 0.3, type: 'damage_single', multiplier: 1.5 }
  },
  brigand_cagoule: {
    name: 'Brigand Cagoulé', hp: 740, maxHp: 740, atk: 160, def: 85, agi: 130, wis: 50,
    color: 0x333333, rarity: 'R',
    skill: { name: 'Frappe Sournoise', chance: 0.32, type: 'damage_single', multiplier: 1.6 }
  },
  araignee_geante: {
    name: 'Araignée Géante', hp: 780, maxHp: 780, atk: 155, def: 90, agi: 120, wis: 60,
    color: 0x2a1a3a, rarity: 'R',
    skill: { name: 'Toile Empoisonnée', chance: 0.3, type: 'damage_aoe', multiplier: 0.7 }
  },

  // --- Palier 3 (chapitres 9-12) ---
  golem_fissure: {
    name: 'Golem Fissuré', hp: 960, maxHp: 960, atk: 190, def: 150, agi: 70, wis: 70,
    color: 0x6a6a5a, rarity: 'SR',
    skill: { name: 'Éclat de Pierre', chance: 0.3, type: 'damage_single', multiplier: 1.8 }
  },
  harpie_sanglante: {
    name: 'Harpie Sanglante', hp: 920, maxHp: 920, atk: 210, def: 110, agi: 160, wis: 80,
    color: 0x9a2a2a, rarity: 'SR',
    skill: { name: 'Plongeon Sanglant', chance: 0.32, type: 'damage_single', multiplier: 1.85 }
  },
  ombre_rampante: {
    name: 'Ombre Rampante', hp: 900, maxHp: 900, atk: 200, def: 100, agi: 150, wis: 100,
    color: 0x1a1a2a, rarity: 'SR',
    skill: { name: 'Étreinte des Ténèbres', chance: 0.3, type: 'damage_aoe', multiplier: 0.9 }
  },

  // --- Palier 4 (chapitres 13-16) ---
  spectre_vengeur: {
    name: 'Spectre Vengeur', hp: 1100, maxHp: 1100, atk: 230, def: 150, agi: 180, wis: 130,
    color: 0x5a7a9a, rarity: 'SR',
    skill: { name: 'Vengeance Spectrale', chance: 0.32, type: 'damage_single', multiplier: 1.95 }
  },
  troll_cavernes: {
    name: 'Troll des Cavernes', hp: 1200, maxHp: 1200, atk: 220, def: 180, agi: 90, wis: 90,
    color: 0x4a5a3a, rarity: 'SR',
    skill: { name: 'Régénération Souterraine', chance: 0.3, type: 'heal_team', power: 220 }
  },
  cyclope_furieux: {
    name: 'Cyclope Furieux', hp: 1150, maxHp: 1150, atk: 245, def: 165, agi: 100, wis: 60,
    color: 0x7a5a2a, rarity: 'SR',
    skill: { name: 'Écrasement Rageur', chance: 0.3, type: 'damage_aoe', multiplier: 0.95 }
  },

  // --- Palier 5 (chapitres 17-20) ---
  demon_mineur: {
    name: 'Démon Mineur', hp: 1300, maxHp: 1300, atk: 270, def: 190, agi: 190, wis: 150,
    color: 0x8a1a1a, rarity: 'SSR',
    skill: { name: 'Flammes Infernales', chance: 0.32, type: 'damage_aoe', multiplier: 1.05 }
  },
  liche_novice: {
    name: 'Liche Novice', hp: 1280, maxHp: 1280, atk: 265, def: 175, agi: 170, wis: 200,
    color: 0x2a6a5a, rarity: 'SSR',
    skill: { name: 'Malédiction Drainante', chance: 0.35, type: 'heal_team', power: 280 }
  },
  gargouille_jade: {
    name: 'Gargouille de Jade', hp: 1350, maxHp: 1350, atk: 255, def: 210, agi: 160, wis: 120,
    color: 0x2a8a5a, rarity: 'SSR',
    skill: { name: 'Éclat de Jade', chance: 0.3, type: 'damage_single', multiplier: 2.0 }
  },

  // --- Palier 6 (chapitres 21-24) ---
  chevalier_dechu: {
    name: 'Chevalier Déchu', hp: 1500, maxHp: 1500, atk: 300, def: 220, agi: 170, wis: 110,
    color: 0x3a1a1a, rarity: 'SSR',
    skill: { name: 'Serment Brisé', chance: 0.32, type: 'damage_single', multiplier: 2.1 }
  },
  hydre_bicephale: {
    name: 'Hydre Bicéphale', hp: 1600, maxHp: 1600, atk: 310, def: 210, agi: 150, wis: 130,
    color: 0x1a5a3a, rarity: 'SSR',
    skill: { name: 'Double Morsure', chance: 0.35, type: 'damage_aoe', multiplier: 1.1 }
  },
  vouivre_ecarlate: {
    name: 'Vouivre Écarlate', hp: 1550, maxHp: 1550, atk: 320, def: 200, agi: 220, wis: 140,
    color: 0xaa1a2a, rarity: 'SSR',
    skill: { name: 'Souffle Écarlate', chance: 0.32, type: 'damage_aoe', multiplier: 1.15 }
  },

  // --- Boss d'Acte (remplacent le boss unique recyclé sur les Actes I et II) ---
  gardien_foret: {
    name: 'Gardien de la Forêt Maudite', hp: 1450, maxHp: 1450, atk: 260, def: 170, agi: 120, wis: 110,
    color: 0x114411, rarity: 'SR',
    skill: { name: 'Racines Étrangleuses', chance: 0.35, type: 'damage_aoe', multiplier: 1.0 }
  },
  seigneur_donjon: {
    name: 'Seigneur du Donjon Maudit', hp: 1950, maxHp: 1950, atk: 310, def: 210, agi: 150, wis: 150,
    color: 0x441144, rarity: 'SSR',
    skill: { name: 'Jugement du Donjon', chance: 0.35, type: 'damage_single', multiplier: 2.2 }
  }
};