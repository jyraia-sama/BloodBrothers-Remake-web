// ============================================================
//  SYSTÈME DE NIVEAU / EXPÉRIENCE
//  Niveau max : 30. Les stats de base des unités (dans
//  HEROES_DATABASE / SUMMON_POOL_DATABASE) représentent le
//  niveau 1 ; ce module calcule les stats à un niveau donné.
// ============================================================

export const MAX_LEVEL = 30;

// Croissance des stats par point de niveau, selon la rareté
// (plus la rareté est haute, plus l'unité gagne en puissance par niveau)
const GROWTH_BY_RARITY = {
  N: 0.035,
  R: 0.045,
  SR: 0.055,
  SSR: 0.065,
  UR: 0.075
};

/**
 * XP nécessaire pour passer du niveau `level` à `level + 1`.
 */
export function xpForNextLevel(level) {
  if (level >= MAX_LEVEL) return Infinity;
  return Math.round(40 * Math.pow(level, 1.55)) + 20;
}

/**
 * XP totale cumulée nécessaire pour atteindre `level` depuis le niveau 1.
 * Utile pour afficher une barre de progression globale si besoin.
 */
export function totalXpForLevel(level) {
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += xpForNextLevel(l);
  }
  return total;
}

/**
 * Calcule les stats effectives d'une unité de base à un niveau donné.
 * Ne modifie pas l'objet d'origine.
 */
export function getStatsAtLevel(baseUnit, level) {
  const clampedLevel = Math.max(1, Math.min(MAX_LEVEL, level));
  const growth = GROWTH_BY_RARITY[baseUnit.rarity] || 0.045;
  const factor = 1 + growth * (clampedLevel - 1);
  const scale = (val) => Math.round(val * factor);

  return {
    ...baseUnit,
    level: clampedLevel,
    hp: scale(baseUnit.hp),
    maxHp: scale(baseUnit.hp),
    atk: scale(baseUnit.atk),
    def: scale(baseUnit.def),
    agi: scale(baseUnit.agi),
    wis: scale(baseUnit.wis)
  };
}

/**
 * Crée une nouvelle instance d'unité possédée par le joueur
 * (niveau 1, 0 XP, identifiant unique pour gérer les doublons).
 */
export function createUnitInstance(unitKey) {
  return {
    instanceId: `${unitKey}_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    unitKey,
    level: 1,
    xp: 0,
    fusionCount: 0 // nombre de fusions absorbées (+15% ATK/PV cumulatif à chaque fusion)
  };
}

/**
 * Calcule les stats effectives d'une instance possédée : applique à la fois
 * la croissance de niveau ET les bonus cumulés des fusions.
 */
export function getInstanceStats(baseUnit, instance) {
  const leveled = getStatsAtLevel(baseUnit, instance.level);
  const fusionFactor = Math.pow(1.15, instance.fusionCount || 0);

  return {
    ...leveled,
    atk: Math.round(leveled.atk * fusionFactor),
    hp: Math.round(leveled.hp * fusionFactor),
    maxHp: Math.round(leveled.maxHp * fusionFactor)
  };
}

/**
 * Ajoute de l'XP à une instance d'unité et gère la montée de niveau
 * (potentiellement plusieurs niveaux d'un coup).
 * Modifie `instance` directement et retourne le nombre de niveaux gagnés.
 */
export function addXP(instance, amount) {
  let levelsGained = 0;
  instance.xp += amount;

  while (instance.level < MAX_LEVEL) {
    const needed = xpForNextLevel(instance.level);
    if (instance.xp >= needed) {
      instance.xp -= needed;
      instance.level += 1;
      levelsGained += 1;
    } else {
      break;
    }
  }

  if (instance.level >= MAX_LEVEL) {
    instance.xp = 0; // XP plafonnée, plus rien à gagner
  }

  return levelsGained;
}

// ============================================================
//  NIVEAU DE COMPTE (progression globale du joueur)
//  Chaque niveau de compte augmente la stamina maximale.
// ============================================================

export const MAX_ACCOUNT_LEVEL = 30;
export const BASE_MAX_STAMINA = 10;

/** XP de compte nécessaire pour passer du niveau `level` au suivant. */
export function accountXpForNextLevel(level) {
  if (level >= MAX_ACCOUNT_LEVEL) return Infinity;
  return Math.round(120 * Math.pow(level, 1.4)) + 80;
}

/**
 * Stamina maximale pour un niveau de compte donné.
 * +1 stamina tous les 2 niveaux : 10 au niveau 1, 24 au niveau 30.
 */
export function maxStaminaForAccountLevel(level) {
  const clamped = Math.max(1, Math.min(MAX_ACCOUNT_LEVEL, level));
  return BASE_MAX_STAMINA + Math.floor((clamped - 1) / 2);
}

/**
 * Ajoute de l'XP de compte au joueur. Met à jour le niveau et la stamina max.
 * Chaque montée de niveau restaure également la stamina au maximum.
 * Retourne le nombre de niveaux gagnés.
 */
export function addAccountXP(playerData, amount) {
  if (playerData.accountLevel === undefined) playerData.accountLevel = 1;
  if (playerData.accountXp === undefined) playerData.accountXp = 0;

  let levelsGained = 0;
  playerData.accountXp += amount;

  while (playerData.accountLevel < MAX_ACCOUNT_LEVEL) {
    const needed = accountXpForNextLevel(playerData.accountLevel);
    if (playerData.accountXp >= needed) {
      playerData.accountXp -= needed;
      playerData.accountLevel += 1;
      levelsGained += 1;
    } else {
      break;
    }
  }

  if (playerData.accountLevel >= MAX_ACCOUNT_LEVEL) {
    playerData.accountXp = 0;
  }

  playerData.maxStamina = maxStaminaForAccountLevel(playerData.accountLevel);

  if (levelsGained > 0) {
    // Récompense de montée de niveau : stamina restaurée au maximum
    playerData.stamina = playerData.maxStamina;
  }

  return levelsGained;
}

/** Progression (0 à 1) vers le prochain niveau de compte. */
export function getAccountProgress(playerData) {
  const level = playerData.accountLevel || 1;
  if (level >= MAX_ACCOUNT_LEVEL) return 1;
  return Math.min(1, (playerData.accountXp || 0) / accountXpForNextLevel(level));
}

/** XP de compte gagnée après un combat victorieux. */
export function accountXpRewardForBattle(chapter, isBoss) {
  const chapterNum = chapter && chapter.chapterNum ? chapter.chapterNum : 1;
  const actId = chapter && chapter.actId ? chapter.actId : 1;

  const base = 20 + (chapterNum - 1) * 6 + (actId - 1) * 45;
  return isBoss ? Math.round(base * 3) : base;
}

/**
 * Prix de vente d'une carte selon sa rareté (à l'Autel de Fusion
 * on préfère fusionner, mais une carte non équipée peut aussi être
 * revendue directement depuis la Gestion du Deck).
 */
export const SELL_PRICE_BY_RARITY = {
  N: 20,
  R: 60,
  SR: 150,
  SSR: 400,
  UR: 900
};

export function getSellPrice(baseUnit) {
  return SELL_PRICE_BY_RARITY[baseUnit.rarity] || 20;
}

/**
 * Description lisible d'un sort (nom, chance, effet), utilisée
 * pour les bulles d'info au survol.
 */
export function describeSkill(skill) {
  if (!skill) return 'Aucune compétence.';

  const chance = Math.round(skill.chance * 100);
  let effect = '';

  switch (skill.type) {
    case 'damage_single':
      effect = `Inflige ${skill.multiplier}x ATK à une cible.`;
      break;
    case 'damage_aoe':
      effect = `Inflige ${skill.multiplier}x ATK à toute l'équipe adverse.`;
      break;
    case 'heal_team':
      effect = `Soigne toute l'équipe de ${skill.power} PV.`;
      break;
    case 'heal_lowest':
      effect = `Soigne l'allié le plus faible de ${skill.power} PV.`;
      break;
    case 'buff_atk':
      effect = `Augmente l'ATK de l'équipe de ${skill.amount}.`;
      break;
    default:
      effect = '';
  }

  return `${skill.name}\n${chance}% de déclenchement\n${effect}`;
}

/**
 * XP gagnée par unité survivante après une victoire.
 * Les combats de boss et les chapitres avancés rapportent davantage.
 */
export function xpRewardForBattle(chapter, isBoss) {
  const chapterNum = chapter && chapter.chapterNum ? chapter.chapterNum : 1;
  const actId = chapter && chapter.actId ? chapter.actId : 1;

  const base = 25 + (chapterNum - 1) * 8 + (actId - 1) * 60;
  return isBoss ? Math.round(base * 3) : base;
}

/**
 * Progression (0 à 1) vers le prochain niveau, pour une barre d'XP.
 */
export function getLevelProgress(instance) {
  if (instance.level >= MAX_LEVEL) return 1;
  const needed = xpForNextLevel(instance.level);
  return Math.min(1, instance.xp / needed);
}