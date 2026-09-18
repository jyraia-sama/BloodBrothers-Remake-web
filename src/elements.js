// ============================================================
//  SYSTÈME ÉLÉMENTAIRE
//  Cycle à 5 éléments : chacun est fort contre le suivant,
//  faible contre le précédent.
//  Feu → Nature → Eau → Ténèbres → Sacré → (Feu)
// ============================================================

export const ELEMENTS = ['feu', 'nature', 'eau', 'tenebres', 'sacre'];

/** Nombre de positions "Avant" dans une équipe (le reste est "Arrière"). */
export const FRONT_ROW_SIZE = 2;

export const ELEMENT_LABELS = {
  feu: '🔥 Feu',
  nature: '🌿 Nature',
  eau: '💧 Eau',
  tenebres: '🌑 Ténèbres',
  sacre: '✨ Sacré'
};

export const ELEMENT_ICONS = {
  feu: '🔥',
  nature: '🌿',
  eau: '💧',
  tenebres: '🌑',
  sacre: '✨'
};

export const ELEMENT_COLORS = {
  feu: '#ff5533',
  nature: '#55cc55',
  eau: '#3399ff',
  tenebres: '#aa77ee',
  sacre: '#ffdd66'
};

const ADVANTAGE_MULTIPLIER = 1.25;
const DISADVANTAGE_MULTIPLIER = 0.8;

/**
 * Multiplicateur de dégâts d'un attaquant contre un défenseur selon leurs
 * éléments respectifs. Retourne 1 (neutre) si l'un des deux élément est
 * absent ou inconnu.
 */
export function getElementMultiplier(attackerElement, defenderElement) {
  if (!attackerElement || !defenderElement) return 1;

  const ai = ELEMENTS.indexOf(attackerElement);
  const di = ELEMENTS.indexOf(defenderElement);
  if (ai === -1 || di === -1) return 1;

  if ((ai + 1) % ELEMENTS.length === di) return ADVANTAGE_MULTIPLIER;
  if ((di + 1) % ELEMENTS.length === ai) return DISADVANTAGE_MULTIPLIER;
  return 1;
}

/** 'avantage' | 'desavantage' | 'neutre', pour affichage. */
export function getElementRelation(attackerElement, defenderElement) {
  const mult = getElementMultiplier(attackerElement, defenderElement);
  if (mult > 1) return 'avantage';
  if (mult < 1) return 'desavantage';
  return 'neutre';
}