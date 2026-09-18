export const CHANGELOG_DATA = [
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
      "Autel d'Invocation : le Pacte Doré (100 Or) ne permet plus d'invoquer que des N/R/SR ; les SSR et UR nécessitent un Pacte Supérieur (Éclat)."
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