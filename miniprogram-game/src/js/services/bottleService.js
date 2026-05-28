import { getPlayer, savePlayer } from './dataAdapter.js';
import { BOTTLES, getBottleById } from '../data/bottles.js';
import { BLIND_BOX_THRESHOLD, COLLECTION_MILESTONES } from '../utils/constants.js';
import { economyService } from './economyService.js';

export const bottleService = {
  getInventory() {
    const p = getPlayer();
    return Object.entries(p.bottles)
      .map(([id, count]) => ({ bottle: getBottleById(id), count }))
      .filter(item => item.bottle);
  },

  getCollectionCount() {
    return Object.keys(getPlayer().bottles).length;
  },

  addBottle(bottleId) {
    const p = getPlayer();
    const isNew = !p.bottles[bottleId];
    if (isNew) { p.bottles[bottleId] = 1; p.ownedNewCount++; }
    else { p.bottles[bottleId]++; }
    var milestone = null;
    if (isNew) {
      const ownedCount = Object.keys(p.bottles).length;
      for (var i = 0; i < COLLECTION_MILESTONES.length; i++) {
        var ms = COLLECTION_MILESTONES[i];
        if (ownedCount >= ms.count && !p.milestonesReached.includes(String(ms.count))) {
          p.milestonesReached.push(String(ms.count));
          milestone = ms;
          if (ms.reward.coins) economyService.addCoins(ms.reward.coins);
          if (ms.reward.ticket) {
            if (!p.pityTickets) p.pityTickets = { rare: 0, precious: 0, epic: 0 };
            p.pityTickets[ms.reward.ticket] = (p.pityTickets[ms.reward.ticket] || 0) + 1;
          }
          break;
        }
      }
    }
    savePlayer();
    return { isNew, count: p.bottles[bottleId], milestone: milestone, bottle: getBottleById(bottleId) };
  },

  removeBottle(bottleId, count) {
    count = count || 1;
    const p = getPlayer();
    const current = p.bottles[bottleId] || 0;
    if (current < count) return false;
    p.bottles[bottleId] = current - count;
    if (p.bottles[bottleId] <= 0) { delete p.bottles[bottleId]; if (p.ownedNewCount > 0) p.ownedNewCount--; }
    savePlayer();
    return true;
  },

  getCount(bottleId) { return getPlayer().bottles[bottleId] || 0; },

  checkBlindBox() {
    const p = getPlayer();
    return Math.floor(p.ownedNewCount / BLIND_BOX_THRESHOLD) > p.blindBoxUsed;
  },

  useBlindBox() {
    const p = getPlayer();
    if (!this.checkBlindBox()) return false;
    p.blindBoxUsed++;
    savePlayer();
    return true;
  },

  getAlbum() {
    return BOTTLES.map(b => ({ ...b, owned: (getPlayer().bottles[b.id] || 0) > 0 }));
  },

  getNextMilestone() {
    const p = getPlayer();
    const ownedCount = Object.keys(p.bottles).length;
    for (var i = 0; i < COLLECTION_MILESTONES.length; i++) {
      if (ownedCount < COLLECTION_MILESTONES[i].count) return COLLECTION_MILESTONES[i];
    }
    return null;
  },

  getCategoryCompletion(cat) {
    var bottles = BOTTLES.filter(b => b.category === cat && !b.limited && !b.synthesizable);
    var owned = bottles.filter(b => getPlayer().bottles[b.id]).length;
    return { owned: owned, total: bottles.length, complete: owned >= bottles.length };
  },
};
