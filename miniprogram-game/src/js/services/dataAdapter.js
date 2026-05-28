const STORAGE_KEY = 'bottle_game_save';

const DEFAULT_PLAYER = {
  coins: 200,
  bottles: {},
  lockedBottles: [],
  machines: ['vm_soda'],
  ownedNewCount: 0,
  blindBoxUsed: 0,
  pityCounts: { 3: 0, 4: 0, 5: 0 },
  lastLimitedPull: 0,
  coolingPullRemaining: 0,
  luckyPoints: 0,
  milestonesReached: [],
  consecutiveDays: 0,
  lastSignDate: '',
  pityTickets: { rare: 0, precious: 0, epic: 0 },
  achievements: {},
  discoveredRecipes: [],
  totalEarnedCoins: 0,
  totalSoldBottles: 0,
  totalSynthCount: 0,
  totalAgainOneCount: 0,
  totalPulls: 0,
};

export const dataAdapter = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        const merged = { ...DEFAULT_PLAYER };
        for (var k in data) {
          if (data.hasOwnProperty(k)) merged[k] = data[k];
        }
        merged.pityCounts = { ...DEFAULT_PLAYER.pityCounts, ...(data.pityCounts || {}) };
        merged.lockedBottles = data.lockedBottles || [];
        merged.milestonesReached = data.milestonesReached || [];
        merged.pityTickets = { ...DEFAULT_PLAYER.pityTickets, ...(data.pityTickets || {}) };
        merged.achievements = data.achievements || {};
        merged.discoveredRecipes = data.discoveredRecipes || [];
        merged.lastLimitedPull = data.lastLimitedPull || 0;
        merged.coolingPullRemaining = data.coolingPullRemaining || 0;
        merged.luckyPoints = data.luckyPoints || 0;
        merged.consecutiveDays = data.consecutiveDays || 0;
        merged.lastSignDate = data.lastSignDate || '';
        merged.totalEarnedCoins = data.totalEarnedCoins || 0;
        merged.totalSoldBottles = data.totalSoldBottles || 0;
        merged.totalSynthCount = data.totalSynthCount || 0;
        merged.totalAgainOneCount = data.totalAgainOneCount || 0;
        merged.totalPulls = data.totalPulls || 0;
        return merged;
      }
    } catch (e) {
      console.warn('读取存档失败', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PLAYER));
  },

  save(playerData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playerData));
    } catch (e) {
      console.error('保存存档失败', e);
    }
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

let _player = null;

export function getPlayer() {
  if (!_player) _player = dataAdapter.load();
  return _player;
}

export function savePlayer() {
  if (_player) dataAdapter.save(_player);
}

export function resetPlayer() {
  _player = JSON.parse(JSON.stringify(DEFAULT_PLAYER));
  dataAdapter.save(_player);
}
