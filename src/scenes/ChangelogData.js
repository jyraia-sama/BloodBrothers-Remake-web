export const CHANGELOG_DATA = [
  {
    date: "19/09/2026",
    points: [
      "Ajout du système d'Équipement Échos Sanguins : 6 emplacements par unité, rareté à substats, amélioration +1 à +15, et 7 Sets d'ensemble (Violent, Swift, Fatal, Vampire, Energy, Guard, Shield).",
      "Nouveau menu ÉCHOS SANGUINS dédié : choix du héros, puis équipement/amélioration/vente des Échos avec filtres par Set, Slot et rareté.",
      "Aventure entièrement refaite : 7 Actes (un par Set d'Écho) de 6 chapitres chacun ; chaque chapitre loot un emplacement précis, indiqué dans l'interface.",
      "Fin de combat : trois boutons (Rejouer, Continuer, Choix du chapitre) remplacent la transition automatique.",
      "Autel d'Invocation : ajout d'un pack x10 pour les deux pactes, avec grille des unités obtenues et inspection individuelle des statistiques.",
      "Autel d'Invocation : affichage des taux de drop réels (%) pour chaque rareté, sur les deux pactes.",
      "Gestion du Deck : vente groupée de plusieurs cartes non équipées en une fois (sélection par case à cocher).",
      "Gestion du Deck : repositionnement des étiquettes Avant/Arrière pour ne plus chevaucher le nom des cartes.",
      "Gestion du Deck : la position de défilement de la réserve n'est plus réinitialisée après une vente.",
      "Autel de Fusion : la rareté s'affiche désormais sur la carte choisie comme unité Principale.",
      "Correction : sur les écrans à défilement (Deck, Échos Sanguins, Fusion, Aventure), les boutons fixes (retour, emplacements) étaient parfois cliqués par erreur par du contenu défilé invisible.",
      "Correction : le menu déroulant de sélection ne validait pas toujours le choix effectué."
    ]
  },
  {
    date: "18/09/2026",
    points: [
      "Ajout d'un système élémentaire (Feu, Nature, Eau, Ténèbres, Sacré) en cycle : +25% de dégâts en avantage, -20% en désavantage.",
      "Chaque héros et monstre possède désormais un élément, visible sur les cartes (Deck, Fusion, Invocation) et en combat.",
      "Ajout du positionnement d'équipe Avant/Arrière : les 2 premières cartes du deck sont ciblées en priorité par l'adversaire.",
      "Gestion du Deck : ajout de flèches pour réorganiser l'ordre des cartes équipées (et donc leur position Avant/Arrière).",
      "Combat de BOSS : le boss est désormais placé en Arrière, protégé par deux sbires en Avant.",
      "Ajout de 4 nouveaux monstres : Lapin Pyromane (SR, Feu), Chat des Abysses (SSR, Eau), Chien Sylvestre (SSR, Nature), Cheval Céleste (UR, Sacré)."
    ]
  },
  {
    date: "17/09/2026",
    points: [
      "Gestion du Deck : la réserve/inventaire défile désormais (molette ou flèches) lorsqu'elle dépasse l'écran.",
      "Gestion du Deck : possibilité de vendre une carte non équipée contre de l'or (prix selon la rareté).",
      "Ajout d'une bulle d'info sur le sort d'une carte, dans la fenêtre de détails.",
      "Autel de Fusion : les héros de l'équipe peuvent désormais être choisis comme unité Principale (jamais comme Sacrifice).",
      "Combat impossible à engager si l'équipe (deck) est vide, avec message d'avertissement.",
      "Notes de mise à jour : contenu déroulant et bouton de retour déplacé en haut à droite.",
      "Correction : le retrait d'une carte de l'équipe équipée ne fonctionnait plus.",
      "Correction : le déverrouillage de chapitre est désormais robuste à un éventuel décalage de progression (Actes 2 et 3 inclus).",
      "Ajout de la rareté UR (Ultra Rare) avec 3 nouveaux monstres, au-dessus des SSR.",
      "Ajout de l'Éclat de Pacte Supérieur : objet looté avec une chance sur les BOSS, permettant d'invoquer des SR/SSR/UR.",
      "Autel d'Invocation : le Pacte Doré (100 Or) ne permet plus d'invoquer que des N/R/SR ; les SSR et UR nécessitent un Pacte Supérieur (Éclat).",
      "Autel de Fusion : ajout du défilement (molette/flèches) sur la grille d'inventaire, oublié lors de la précédente mise à jour.",
      "Mode Administrateur : \"Or à 9999\" devient \"Or infini\", ajout de \"Stamina infinie\" ; décocher une triche restaure désormais la valeur d'avant activation.",
      "Ajout de 20 nouveaux ennemis répartis sur 6 paliers de difficulté couvrant les 24 chapitres, plus un boss dédié pour chaque Acte (l'ancien boss unique ne sert plus que pour l'Acte III).",
      "Correction : le point de position sur la carte d'aventure faisait un aller-retour visuel lors des déplacements.",
      "Correction : image floue sur PC, due à l'agrandissement CSS du canvas ; la résolution de rendu interne est désormais augmentée automatiquement."
    ]
  },
  {
    date: "16/09/2026",
    points: [
      "Aventure : passage à 3 Actes de 8 chapitres chacun, avec difficulté progressive.",
      "Ajout d'embranchements à partir du chapitre 4 de chaque acte, se rejoignant avant le BOSS.",
      "Ajout de 50 nouveaux monstres dans la poule d'invocation, répartis par rareté (N/R/SR/SSR).",
      "Système de niveau pour les unités (max 30), avec croissance des stats selon la rareté.",
      "Ajout d'un niveau de compte (max 30) augmentant la stamina maximale du joueur.",
      "Invocation : tirage désormais pondéré selon la rareté (N 55% / R 30% / SR 12% / SSR 3%).",
      "Autel de Fusion : le bonus est désormais individuel et permanent par carte, au lieu d'affecter toutes les unités du même type.",
      "Correction : le héros de départ choisi n'apparaissait plus dans le deck ni en combat."
    ]
  },
  {
    date: "14/09/2026",
    points: [
      "Externalisation de la poule d'invocation dans un fichier dédié (SummonPoolData.js).",
      "Ajout de l'onglet des notes de mise à jour et extraction des données associées.",
      "Intégration de la statistique magique (WIS) pour l'ensemble des personnages et affichage global (Deck, Sélection de héros).",
      "Exclusion définitive des 8 héros de départ de la poule d'invocations."
    ]
  },
  {
    date: "12/09/2026",
    points: [
      "Ajout du système d'Autel de Fusion.",
      "Intégration du timer de recharge de la stamina."
    ]
  },
  {
    date: "10/09/2026",
    points: [
      "Mise en place de l'architecture de base et des chapitres."
    ]
  }
];