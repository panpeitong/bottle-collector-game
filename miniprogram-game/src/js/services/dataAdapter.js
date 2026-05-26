const STORAGE_KEY = 'bottle_game_save';

const DEFAULT_PLAYER = {
  coins: 200,
  bottles: {},
  lockedBottles: [],
  machines: ['vm_soda'],
  ownedNewCount: 0,
  blindBoxUsed: 0,
  pityCounts: { 3: 0, 4: 0, 5: 0 },
};

export const dataAdapter = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        const merged = { ...DEFAULT_PLAYER, ...data };
        merged.pityCounts = { ...DEFAULT_PLAYER.pityCounts, ...(data.pityCounts || {}) };
        merged.lockedBottles = data.lockedBottles || [];
        return merged;
      }
    } catch (e) {
      console.warn('读取存档失败', e);
    }
    return { ...DEFAULT_PLAYER, lockedBottles: [], pityCounts: { ...DEFAULT_PLAYER.pityCounts } };
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
  if (!_player) {
    _player = dataAdapter.load();
  }
  return _player;
}

export function savePlayer() {
  if (_player) {
    dataAdapter.save(_player);
  }
}
