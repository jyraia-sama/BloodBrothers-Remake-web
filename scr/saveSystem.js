export const STAMINA_REGEN_INTERVAL = 300000; // 5 minutes en millisecondes (par exemple)

export const PLAYER_DATA = {
  hasChosenHero: false,
  gold: 500,
  stamina: 10,
  maxStamina: 10,
  lastStaminaUpdate: Date.now(),
  inventory: [], // Clés des unités
  equipmentInventory: ['epee_fer', 'cote_maille', 'anneau_vie'], // Équipements possédés
  deck: [], // 4 unités max
  currentChapter: 1,
  currentTile: 0,
  currentHpState: {} // Stocke les PV des unités en cours de run
};

export function saveGameData() {
  localStorage.setItem('blood_brothers_save', JSON.stringify(PLAYER_DATA));
}

export function loadGameData() {
  const saved = localStorage.getItem('blood_brothers_save');
  if (saved) {
    const data = JSON.parse(saved);
    Object.assign(PLAYER_DATA, data);
  }
}

export function resetGameData() {
  localStorage.removeItem('blood_brothers_save');
  PLAYER_DATA.hasChosenHero = false;
  PLAYER_DATA.gold = 500;
  PLAYER_DATA.stamina = 10;
  PLAYER_DATA.maxStamina = 10;
  PLAYER_DATA.lastStaminaUpdate = Date.now();
  PLAYER_DATA.inventory = [];
  PLAYER_DATA.equipmentInventory = ['epee_fer', 'cote_maille', 'anneau_vie'];
  PLAYER_DATA.deck = [];
  PLAYER_DATA.currentChapter = 1;
  PLAYER_DATA.currentTile = 0;
  PLAYER_DATA.currentHpState = {};
}

loadGameData();