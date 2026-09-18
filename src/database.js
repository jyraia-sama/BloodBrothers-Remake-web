import { SUMMON_POOL_DATABASE } from './scenes/SummonPoolData.js';

export const HEROES_DATABASE = {
  brute_noire: { name: 'La Brute Noire', race: 'Gorille', hp: 1400, maxHp: 1400, atk: 320, def: 110, agi: 60, wis: 50, color: 0x222222, rarity: 'SSR', element: 'tenebres', skill: { name: 'Frappe Brutale', chance: 0.35, type: 'damage_single', multiplier: 2.0 } },
  barbe_bleue: { name: 'Barbe Bleue', race: 'Nain', hp: 1200, maxHp: 1200, atk: 160, def: 240, agi: 80, wis: 150, color: 0x114488, rarity: 'SSR', element: 'eau', skill: { name: 'Bouclier Magique', chance: 0.4, type: 'heal_team', power: 250 } },
  lance_doree: { name: 'La Lance Dorée', race: 'Homme-Lézard', hp: 900, maxHp: 900, atk: 220, def: 90, agi: 260, wis: 70, color: 0xddaa00, rarity: 'SSR', element: 'sacre', skill: { name: 'Estoc Éclair', chance: 0.35, type: 'damage_single', multiplier: 1.7 } },
  nymphe: { name: 'La Nymphe', race: 'Elfe', hp: 950, maxHp: 950, atk: 150, def: 200, agi: 110, wis: 220, color: 0x22aa55, rarity: 'SSR', element: 'sacre', skill: { name: 'Soin Sacré', chance: 0.4, type: 'heal_lowest', power: 400 } },
  mage_gris: { name: 'Le Mage Gris', race: 'Gobelin', hp: 800, maxHp: 800, atk: 260, def: 70, agi: 220, wis: 250, color: 0x777788, rarity: 'SSR', element: 'feu', skill: { name: 'Explosion Magique', chance: 0.3, type: 'damage_aoe', multiplier: 1.1 } },
  dague_violette: { name: 'La Dague Violette', race: 'Elfe Sombre', hp: 850, maxHp: 850, atk: 290, def: 80, agi: 180, wis: 90, color: 0x660099, rarity: 'SSR', element: 'tenebres', skill: { name: 'Lame d\'Ombre', chance: 0.35, type: 'damage_single', multiplier: 1.9 } },
  samourai_rouge: { name: 'Le Samouraï Rouge', race: 'Humain', hp: 1000, maxHp: 1000, atk: 280, def: 100, agi: 200, wis: 60, color: 0xcc1111, rarity: 'SSR', element: 'feu', skill: { name: 'Entaille Rapide', chance: 0.35, type: 'damage_single', multiplier: 1.8 } },
  chevalier_blanc: { name: 'Le Chevalier Blanc', race: 'Humain', hp: 1250, maxHp: 1250, atk: 250, def: 220, agi: 90, wis: 100, color: 0xeeeeee, rarity: 'SSR', element: 'sacre', skill: { name: 'Charge Sainte', chance: 0.3, type: 'damage_single', multiplier: 1.6 } }
};

export const UNITS_DATABASE = {
  ...HEROES_DATABASE,
  ...SUMMON_POOL_DATABASE
};

// ============================================================
//  ACTES & CHAPITRES
// ============================================================

const ACTS_CONFIG = [
  {
    id: 1,
    title: 'Acte I : La Forêt Sombre',
    bgColor: 0x112211,
    bossUnit: 'gardien_foret',
    baseGold: 100,   // récompense du chapitre 1 de cet acte
    goldStep: 40      // augmentation par chapitre dans l'acte
  },
  {
    id: 2,
    title: 'Acte II : Le Donjon Maudit',
    bgColor: 0x221122,
    bossUnit: 'seigneur_donjon',
    baseGold: 450,
    goldStep: 90
  },
  {
    id: 3,
    title: 'Acte III : Le Cratère Volcanique',
    bgColor: 0x331111,
    bossUnit: 'boss', // Seigneur Démon : antagoniste final du jeu
    baseGold: 1100,
    goldStep: 180
  }
];

const CHAPTERS_PER_ACT = 8;
const BRANCH_START_CHAPTER = 4; // à partir de ce chapitre (dans chaque acte), embranchements

// ------------------------------------------------------------
//  Répartition des ennemis de zone (hors BOSS) sur les 24
//  chapitres : 6 paliers de difficulté croissante, indépendants
//  des Actes pour que la courbe reste continue sur tout le jeu.
// ------------------------------------------------------------
const ENEMY_TIERS = [
  { maxChapter: 4, keys: ['squelette', 'gobelin_maraudeur', 'loup_affame', 'rat_corrompu'] },
  { maxChapter: 8, keys: ['zombie_enrage', 'brigand_cagoule', 'araignee_geante'] },
  { maxChapter: 12, keys: ['demon_inf', 'golem_fissure', 'harpie_sanglante', 'ombre_rampante'] },
  { maxChapter: 16, keys: ['spectre_vengeur', 'troll_cavernes', 'cyclope_furieux'] },
  { maxChapter: 20, keys: ['demon_mineur', 'liche_novice', 'gargouille_jade'] },
  { maxChapter: 24, keys: ['chevalier_dechu', 'hydre_bicephale', 'vouivre_ecarlate'] }
];

function getEnemyPoolForChapter(globalChapterId) {
  const tier = ENEMY_TIERS.find(t => globalChapterId <= t.maxChapter) || ENEMY_TIERS[ENEMY_TIERS.length - 1];
  return tier.keys;
}

const GOLD_TILE = { type: 'gold', label: 'Trésor', color: 0xddaa00 };
const HEAL_TILE = { type: 'heal', label: 'Fontaine', color: 0x22aa22 };
const BATTLE_TILE = (label = 'Ennemi') => ({ type: 'battle', label, color: 0xaa2222 });
const BOSS_TILE = { type: 'boss', label: 'BOSS', color: 0x8800aa };
const START_TILE = { type: 'start', label: 'Départ', color: 0x333344 };

/**
 * Génère les cases (tiles) d'un chapitre sous forme de graphe.
 * - col : position horizontale (étape sur le chemin)
 * - row : décalage vertical (-1 voie du haut, 0 voie centrale, 1 voie du bas)
 * - next : id(s) des cases suivantes accessibles depuis cette case
 */
function buildTiles(chapterNum) {
  let id = 0;
  const tiles = [];

  const addTile = (base, col, row = 0) => {
    const tile = { id: id++, col, row, next: [], ...base };
    tiles.push(tile);
    return tile;
  };
  const link = (a, b) => a.next.push(b.id);

  if (chapterNum < BRANCH_START_CHAPTER) {
    // ---- Chemin linéaire, longueur croissante ----
    const start = addTile(START_TILE, 0);
    let prev = start;
    let col = 1;

    const middleTiles = [];
    if (chapterNum === 1) middleTiles.push(GOLD_TILE, BATTLE_TILE(), HEAL_TILE, BATTLE_TILE());
    if (chapterNum === 2) middleTiles.push(BATTLE_TILE(), GOLD_TILE, BATTLE_TILE(), HEAL_TILE, BATTLE_TILE('Élite'));
    if (chapterNum === 3) middleTiles.push(BATTLE_TILE(), BATTLE_TILE(), GOLD_TILE, BATTLE_TILE('Garde'), HEAL_TILE, BATTLE_TILE('Élite'));

    middleTiles.forEach(base => {
      const t = addTile(base, col);
      link(prev, t);
      prev = t;
      col++;
    });

    const boss = addTile(BOSS_TILE, col);
    link(prev, boss);
  } else {
    // ---- Chemin avec embranchement qui se rejoint avant le BOSS ----
    const start = addTile(START_TILE, 0);
    let prev = start;
    let col = 1;

    // Introduction avant la fourche (grandit avec la difficulté)
    const introCount = chapterNum >= 6 ? 2 : 1;
    for (let i = 0; i < introCount; i++) {
      const t = addTile(BATTLE_TILE(), col);
      link(prev, t);
      prev = t;
      col++;
    }

    const forkPoint = prev;

    // Longueur des branches : 2 à 4 cases selon le chapitre
    const branchLength = Math.min(4, 2 + Math.floor((chapterNum - BRANCH_START_CHAPTER) / 2));
    const branchCol0 = col;

    let topPrev = forkPoint;
    let botPrev = forkPoint;

    for (let i = 0; i < branchLength; i++) {
      const isLast = i === branchLength - 1;
      const topBase = i === 0 ? GOLD_TILE : (isLast ? BATTLE_TILE('Élite') : BATTLE_TILE());
      const botBase = i === 0 ? BATTLE_TILE() : (isLast ? BATTLE_TILE('Élite') : (i % 2 === 0 ? GOLD_TILE : BATTLE_TILE()));

      const topTile = addTile(topBase, branchCol0 + i, -1);
      const botTile = addTile(botBase, branchCol0 + i, 1);

      link(topPrev, topTile);
      link(botPrev, botTile);

      topPrev = topTile;
      botPrev = botTile;
    }

    col = branchCol0 + branchLength;

    // Case de fusion : les deux voies se rejoignent
    const merge = addTile(HEAL_TILE, col, 0);
    link(topPrev, merge);
    link(botPrev, merge);
    col++;
    prev = merge;

    // Garde supplémentaire pour les derniers chapitres (encore plus dur)
    if (chapterNum >= 7) {
      const guard = addTile(BATTLE_TILE('Garde'), col, 0);
      link(prev, guard);
      prev = guard;
      col++;
    }

    const boss = addTile(BOSS_TILE, col, 0);
    link(prev, boss);
  }

  return tiles;
}

export const ACTS_DATABASE = ACTS_CONFIG.map(act => ({
  ...act,
  chapters: Array.from({ length: CHAPTERS_PER_ACT }, (_, i) => {
    const chapterNum = i + 1;
    const globalId = (act.id - 1) * CHAPTERS_PER_ACT + chapterNum; // id global unique : 1 à 24
    return {
      id: globalId,
      actId: act.id,
      chapterNum,
      title: `${act.title} – Chapitre ${chapterNum}`,
      bgColor: act.bgColor,
      enemyPool: getEnemyPoolForChapter(globalId),
      bossUnit: act.bossUnit,
      rewardGold: act.baseGold + act.goldStep * (chapterNum - 1),
      tiles: buildTiles(chapterNum)
    };
  })
}));

// Liste à plat de tous les chapitres (recherche directe par id global)
export const CHAPTERS_DATABASE = ACTS_DATABASE.flatMap(act => act.chapters);