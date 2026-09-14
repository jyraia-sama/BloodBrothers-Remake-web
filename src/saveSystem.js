const SAVE_KEY = 'BLOOD_BROTHERS_SAVE_V2';
const STAMINA_REGEN_INTERVAL = 5 * 60 * 1000;

const DEFAULT_PLAYER_DATA = {
  hasChosenHero: false,
  stamina: 10,
  maxStamina: 10,
  lastStaminaUpdate: Date.now(),
  gold: 500,
  unlockedChapter: 1,
  currentChapter: 1,
  currentTileIndex: 0,
  inventory: ['archer', 'mage', 'clerc'],
  deck: ['archer', 'mage', 'clerc']
};

export function loadGameData() {
  const saved = localStorage.getItem(SAVE_KEY);
  let data = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_PLAYER_DATA));
  
  const now = Date.now();
  const timePassed = now - (data.lastStaminaUpdate || now);
  const staminaToGained = Math.floor(timePassed / STAMINA_REGEN_INTERVAL);

  if (staminaToGained > 0 && data.stamina < data.maxStamina) {
    data.stamina = Math.min(data.maxStamina, data.stamina + staminaToGained);
    data.lastStaminaUpdate = now - (timePassed % STAMINA_REGEN_INTERVAL);
  } else if (data.stamina >= data.maxStamina) {
    data.lastStaminaUpdate = now;
  }

  return data;
}

export function saveGameData() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(PLAYER_DATA));
}

export function resetGameData() {
  localStorage.removeItem(SAVE_KEY);
  Object.assign(PLAYER_DATA, JSON.parse(JSON.stringify(DEFAULT_PLAYER_DATA)));
  PLAYER_DATA.lastStaminaUpdate = Date.now();
  saveGameData();
}

export const PLAYER_DATA = loadGameData();
export { STAMINA_REGEN_INTERVAL };