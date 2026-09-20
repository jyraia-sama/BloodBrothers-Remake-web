// ============================================================
//  GUIDE DU JEU
//  Synthèse affichée dans le menu (bouton "?") pour expliquer
//  toutes les possibilités du jeu à un nouveau joueur.
// ============================================================

export const GUIDE_SECTIONS = [
  {
    icon: '🎮',
    title: 'Bienvenue',
    body:
      "Brothers of Legacy: Tears and Blood est un RPG au tour par tour : constituez une équipe de 5 unités, " +
      "explorez l'Aventure, invoquez de nouvelles cartes, et équipez-les d'Échos Sanguins pour les rendre plus fortes."
  },
  {
    icon: '🗺️',
    title: 'Aventure',
    body:
      "Depuis le menu Aventure, choisissez d'abord un mode :\n" +
      "• Histoire Principale : 7 Actes de 6 chapitres. Chaque Acte est lié à un Set d'Écho Sanguin, et le chapitre N " +
      "d'un Acte loot toujours l'Emplacement N de ce Set (indiqué sur chaque carte de chapitre).\n" +
      "• À partir du chapitre 4 de chaque Acte, le chemin se divise en deux voies qui se rejoignent avant le BOSS.\n" +
      "• Donjon Quotidien : combat gratuit en Stamina, 3 tentatives par jour (même défi pour tout le monde, change chaque jour).\n" +
      "• Tour Sans Fin : 100 étages en progression séquentielle, un combat par étage, difficulté croissante en continu, boss tous les 10 étages.\n" +
      "• Mode Cauchemar : débloqué une fois les 42 chapitres terminés. Rejoue l'Histoire Principale avec des ennemis renforcés et de meilleures récompenses."
  },
  {
    icon: '⚔️',
    title: 'Combat',
    body:
      "Les 2 premières cartes de votre équipe sont en position Avant (ciblées en priorité par l'ennemi), les 3 suivantes en Arrière.\n" +
      "Chaque unité a un élément (Feu, Nature, Eau, Ténèbres, Sacré) organisé en cycle : chaque élément inflige +25% de dégâts à " +
      "celui qu'il précède dans le cycle, et en subit -20% de celui qui le précède.\n" +
      "L'ordre des tours dépend de l'AGI. Chaque unité peut déclencher sa compétence selon sa chance indiquée."
  },
  {
    icon: '🛡️',
    title: 'Gestion du Deck',
    body:
      "Équipez jusqu'à 5 unités dans votre équipe. Chaque carte progresse en niveau via l'XP gagnée en combat (max niveau 30).\n" +
      "Réorganisez l'ordre de l'équipe avec les flèches ◀▶ pour changer qui est en Avant ou en Arrière.\n" +
      "Vendez les cartes non équipées (une par une ou en sélection groupée) contre de l'or, selon leur rareté."
  },
  {
    icon: '🔮',
    title: "Autel d'Invocation",
    body:
      "Pacte Doré (Or) : invoque des raretés N / R / SR.\n" +
      "Pacte Supérieur (Éclats de Pacte Supérieur, obtenus sur les boss) : invoque des raretés SR / SSR / UR.\n" +
      "Chaque Pacte est disponible en x1 ou x10, et les taux de drop réels sont affichés directement sur l'écran. " +
      "Un Billet de Pacte (objet du Reliquaire) offre une invocation gratuite au Pacte Doré."
  },
  {
    icon: '🔥',
    title: 'Autel de Fusion',
    body:
      "Fusionnez deux unités de même rareté : l'unité Principale gagne +15% ATK/PV de façon cumulative (à chaque fusion), " +
      "l'unité Sacrifice est perdue.\n" +
      "Les héros déjà équipés dans votre équipe peuvent être choisis comme Principale, mais jamais comme Sacrifice."
  },
  {
    icon: '🩸',
    title: 'Échos Sanguins',
    body:
      "Chaque unité a 6 emplacements d'Écho, chacun avec ses propres règles de statistique principale (Crâne = ATK fixe, " +
      "Artère = variable dont AGI, Plaie = DEF fixe, Sacrifice = % variable, Âme = PV fixe, Serment = % variable dont WIS).\n" +
      "Un Écho a une rareté (Normal à Légendaire, qui détermine son nombre de substats) et un grade de 1 à 6 étoiles.\n" +
      "Améliorez-le jusqu'à +15 avec de l'or (taux de succès dégressif en fin de parcours). " +
      "Équipez 2 ou 4 pièces d'un même Set pour activer son bonus (Violent, Swift, Fatal, Vampire, Energy, Guard, Shield)."
  },
  {
    icon: '🏺',
    title: 'Le Reliquaire',
    body:
      "Un ensemble d'objets pour un farm plus ciblé, obtenus surtout sur les combats de boss :\n" +
      "• Poussière d'Écho (en désenchantant un Écho) → Atelier : fabriquez un Écho garanti du Set/Emplacement de votre choix.\n" +
      "• Essence de Set → échangez-en 30 contre un Écho garanti de ce Set.\n" +
      "• Fragments de Héros (boss de la Tour/Cauchemar) → 20 fragments d'un héros SSR/UR = 1 exemplaire garanti.\n" +
      "• Clé de Coffre (combats normaux de l'Aventure) → 5 clés ouvrent un Coffre de Butin (Or, Écho, Éclat).\n" +
      "• Pierre de Reforge / Sceau de Verrouillage : à utiliser directement sur une substat d'Écho depuis sa fiche détail.\n" +
      "• Tome d'XP (Deck) et Élixir de Stamina (Reliquaire) : effets immédiats."
  },
  {
    icon: '📈',
    title: 'Progression',
    body:
      "Chaque unité a un niveau (max 30) qui augmente ses statistiques.\n" +
      "Votre Compte a aussi un niveau (max 30, gagné en combat) qui augmente votre Stamina maximale.\n" +
      "La Stamina se régénère automatiquement avec le temps et est nécessaire pour explorer l'Aventure et la Tour " +
      "(le Donjon Quotidien est gratuit)."
  }
];