import { getPlayer, savePlayer } from './dataAdapter.js';
import { SELL_PRICES } from '../utils/constants.js';
import { BOTTLES } from '../data/bottles.js';

export const economyService = {
  getCoins() {
    return getPlayer().coins;
  },

  addCoins(amount) {
    const p = getPlayer();
    p.coins += amount;
    savePlayer();
    return p.coins;
  },

  spendCoins(amount) {
    const p = getPlayer();
    if (p.coins < amount) return false;
    p.coins -= amount;
    savePlayer();
    return true;
  },

  /** 检查瓶子是否锁定 */
  isLocked(bottleId) {
    return (getPlayer().lockedBottles || []).includes(bottleId);
  },

  /** 切换锁定状态 */
  toggleLock(bottleId) {
    const p = getPlayer();
    if (!p.lockedBottles) p.lockedBottles = [];
    const idx = p.lockedBottles.indexOf(bottleId);
    if (idx >= 0) {
      p.lockedBottles.splice(idx, 1);
    } else {
      p.lockedBottles.push(bottleId);
    }
    savePlayer();
    return !p.lockedBottles.includes(bottleId); // returns new locked state
  },

  /**
   * 卖出瓶子
   * @param {string} bottleId
   * @param {number} count
   * @param {boolean} force — 跳过锁定检查和二次确认
   */
  sellBottle(bottleId, count = 1, opts = {}) {
    var skipLock = opts.skipLock || false;
    var skipConfirm = opts.skipConfirm || false;
    var force = opts.force || false; // 兼容旧调用 force=true
    if (force) { skipLock = true; skipConfirm = true; }
    
    const p = getPlayer();
    const current = p.bottles[bottleId] || 0;
    if (current < count) return { success: false, coins: 0, reason: '数量不足' };

    const bottle = BOTTLES.find(b => b.id === bottleId);
    if (!bottle) return { success: false, coins: 0, reason: '瓶子不存在' };

    // 锁定检查
    if (!skipLock && this.isLocked(bottleId)) {
      return { success: false, coins: 0, reason: '瓶子已锁定', locked: true };
    }

    // 稀有瓶二次确认 (epic/legendary)
    if (!skipConfirm && bottle.rarity >= 4) {
      return { success: false, coins: 0, reason: '稀有瓶需要二次确认', needConfirm: true, rarity: bottle.rarity };
    }

    p.bottles[bottleId] = current - count;
    if (p.bottles[bottleId] <= 0) delete p.bottles[bottleId];

    const price = (SELL_PRICES[bottle.rarity] || 2) * count;
    p.coins += price;
    savePlayer();
    return { success: true, coins: price, newBalance: p.coins };
  },

  dailySignIn() {
    const p = getPlayer();
    const today = new Date().toDateString();
    if (p.lastSignDate === today) return { success: false, coins: 0 };

    p.lastSignDate = today;
    p.coins += 20;
    savePlayer();
    return { success: true, coins: 20, newBalance: p.coins };
  },

  getSellPrice(bottleId) {
    const bottle = BOTTLES.find(b => b.id === bottleId);
    return bottle ? (SELL_PRICES[bottle.rarity] || 2) : 0;
  },
};
