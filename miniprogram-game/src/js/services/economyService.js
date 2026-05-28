import { getPlayer, savePlayer } from './dataAdapter.js';
import { SELL_PRICES, DAILY_SIGN_COINS, CONSECUTIVE_3_BONUS, CONSECUTIVE_7_BONUS } from '../utils/constants.js';
import { BOTTLES } from '../data/bottles.js';

export const economyService = {
  getCoins() { return getPlayer().coins; },

  addCoins(amount) {
    const p = getPlayer();
    p.coins += amount;
    p.totalEarnedCoins = (p.totalEarnedCoins || 0) + amount;
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

  isLocked(bottleId) {
    return (getPlayer().lockedBottles || []).includes(bottleId);
  },

  toggleLock(bottleId) {
    const p = getPlayer();
    if (!p.lockedBottles) p.lockedBottles = [];
    const idx = p.lockedBottles.indexOf(bottleId);
    if (idx >= 0) p.lockedBottles.splice(idx, 1);
    else p.lockedBottles.push(bottleId);
    savePlayer();
    return p.lockedBottles.includes(bottleId);
  },

  sellBottle(bottleId, count, opts) {
    count = count || 1;
    opts = opts || {};
    var skipLock = opts.skipLock || !!opts.force;
    var skipConfirm = opts.skipConfirm || !!opts.force;
    const p = getPlayer();
    const current = p.bottles[bottleId] || 0;
    if (current < count) return { success: false, coins: 0, reason: '数量不足' };
    const bottle = BOTTLES.find(b => b.id === bottleId);
    if (!bottle) return { success: false, coins: 0, reason: '瓶子不存在' };
    if (!skipLock && this.isLocked(bottleId)) return { success: false, coins: 0, reason: '瓶子已锁定', locked: true };
    if (!skipConfirm && bottle.rarity >= 4) return { success: false, coins: 0, reason: '稀有瓶需要二次确认', needConfirm: true, rarity: bottle.rarity };
    p.bottles[bottleId] = current - count;
    if (p.bottles[bottleId] <= 0) delete p.bottles[bottleId];
    const price = (SELL_PRICES[bottle.rarity] || 2) * count;
    p.coins += price;
    p.totalSoldBottles = (p.totalSoldBottles || 0) + count;
    savePlayer();
    return { success: true, coins: price, newBalance: p.coins, bottle: bottle };
  },

  dailySignIn() {
    const p = getPlayer();
    const today = new Date().toDateString();
    if (p.lastSignDate === today) return { success: false, coins: 0, reason: '今天已经签到过了' };
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (p.lastSignDate === yesterday) {
      p.consecutiveDays = (p.consecutiveDays || 0) + 1;
    } else if (p.lastSignDate && p.lastSignDate !== today) {
      p.consecutiveDays = 1;
    } else {
      p.consecutiveDays = 1;
    }
    p.lastSignDate = today;
    var totalCoins = DAILY_SIGN_COINS;
    var extras = [];
    if (p.consecutiveDays === 3) { totalCoins += CONSECUTIVE_3_BONUS; extras.push('连续3天 +15'); }
    if (p.consecutiveDays === 7) { totalCoins += CONSECUTIVE_7_BONUS; extras.push('连续7天 +50'); }
    p.coins += totalCoins;
    savePlayer();
    return { success: true, coins: totalCoins, newBalance: p.coins, consecutiveDays: p.consecutiveDays, extras: extras };
  },

  getSellPrice(bottleId) {
    const bottle = BOTTLES.find(b => b.id === bottleId);
    return bottle ? (SELL_PRICES[bottle.rarity] || 2) : 0;
  },
};
