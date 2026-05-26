import { getPlayer, savePlayer } from './dataAdapter.js';
import { BOTTLES, getBottleById } from '../data/bottles.js';
import { BLIND_BOX_THRESHOLD } from '../utils/constants.js';

export const bottleService = {
  getInventory() {
    const p = getPlayer();
    return Object.entries(p.bottles)
      .map(([id, count]) => ({ bottle: getBottleById(id), count }))
      .filter(item => item.bottle);
  },

  getCollectionCount() {
    const p = getPlayer();
    return Object.keys(p.bottles).length;
  },

  addBottle(bottleId) {
    const p = getPlayer();
    const isNew = !p.bottles[bottleId];
    if (isNew) {
      p.bottles[bottleId] = 1;
      p.ownedNewCount++;
    } else {
      p.bottles[bottleId]++;
    }
    savePlayer();
    return { isNew, count: p.bottles[bottleId] };
  },

  removeBottle(bottleId, count = 1) {
    const p = getPlayer();
    const current = p.bottles[bottleId] || 0;
    if (current < count) return false;
    p.bottles[bottleId] = current - count;
    if (p.bottles[bottleId] <= 0) {
      delete p.bottles[bottleId];
      // 卖出全部后减少收集计数
      if (p.ownedNewCount > 0) p.ownedNewCount--;
    }
    savePlayer();
    return true;
  },

  getCount(bottleId) {
    return getPlayer().bottles[bottleId] || 0;
  },

  checkBlindBox() {
    const p = getPlayer();
    const earned = Math.floor(p.ownedNewCount / BLIND_BOX_THRESHOLD);
    return earned > p.blindBoxUsed;
  },

  useBlindBox() {
    const p = getPlayer();
    if (!this.checkBlindBox()) return false;
    p.blindBoxUsed++;
    savePlayer();
    return true;
  },

  getAlbum() {
    return BOTTLES.map(b => ({
      ...b,
      owned: (getPlayer().bottles[b.id] || 0) > 0,
    }));
  },
};
