import { getPlayer, savePlayer } from './dataAdapter.js';
import { BOTTLES } from '../data/bottles.js';
import { RARITY, SELL_PRICES } from '../utils/constants.js';
import { economyService } from './economyService.js';
import { bottleService } from './bottleService.js';

const SESSION_TIMES = [
  { start: 9, end: 12, label: '早市' },
  { start: 15, end: 18, label: '午市' },
];

function getCurrentHour() {
  if (window.__yamadaForceAvailable) return 10;
  return new Date().getHours();
}

function getCurrentSession() {
  const hour = getCurrentHour();
  return SESSION_TIMES.find(s => hour >= s.start && hour < s.end) || null;
}

/** Simple deterministic hash from a number */
function hashNum(n) {
  let h = n;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return Math.abs(h % 10000) / 10000; // 0-1
}

/** Generate price multiplier based on current minute timestamp */
function getMinuteMultiplier(rarity, minuteOffset = 0) {
  const now = new Date();
  // Use the current minute (rounded) as base
  const minute = Math.floor(now.getTime() / 60000) + minuteOffset;
  const base = hashNum(minute * (rarity === RARITY.EPIC ? 7 : 13) + 42);

  // Map 0-1 to 0.5-3.0 with some sinusoidal variation
  const sinWave = Math.sin(minute * 0.1) * 0.3;
  return +(0.5 + base * 2.5 + sinWave).toFixed(1);
}

var _yamadaCache = null;

export const yamadaService = {
  getSessionStatus() {
    const session = getCurrentSession();
    if (!session) {
      _yamadaCache = null;
      return { active: false, reason: '山田先生不在，请于 9:00-12:00 或 15:00-18:00 来访' };
    }

    var now = new Date();
    var currentMinute = Math.floor(now.getTime() / 60000);
    
    // 同一分钟内返回缓存价格
    if (_yamadaCache && _yamadaCache.minute === currentMinute && _yamadaCache.session === session.label) {
      return _yamadaCache.status;
    }
    
    var prices = {};
    prices[RARITY.EPIC] = getMinuteMultiplier(RARITY.EPIC);
    prices[RARITY.LEGENDARY] = getMinuteMultiplier(RARITY.LEGENDARY);
    prices.generatedAt = currentMinute;
    prices.nextUpdateAt = currentMinute + 1;

    var status = { active: true, session: session.label, prices: prices };
    _yamadaCache = { minute: currentMinute, session: session.label, status: status };
    return status;
  },

  /** Get trend: is price expected to go up/down next minute */
  getTrend(rarity) {
    const current = getMinuteMultiplier(rarity);
    const next = getMinuteMultiplier(rarity, 1);
    if (next > current + 0.2) return 'up';
    if (next < current - 0.2) return 'down';
    return 'stable';
  },

  getSellableBottles() {
    const status = this.getSessionStatus();
    if (!status.active) return [];
    const inventory = bottleService.getInventory();
    return inventory.filter(item => {
      if (item.bottle.rarity < RARITY.EPIC) return false;
      if (economyService.isLocked(item.bottle.id)) return false;
      return true;
    });
  },

  sellToYamada(bottleId) {
    const status = this.getSessionStatus();
    if (!status.active) return { success: false, reason: '山田先生不在' };

    const bottle = BOTTLES.find(b => b.id === bottleId);
    if (!bottle) return { success: false, reason: '瓶子不存在' };
    if (bottle.rarity < RARITY.EPIC) return { success: false, reason: '山田先生只收紫色和金色罐头' };
    if (economyService.isLocked(bottleId)) return { success: false, reason: '瓶子已锁定' };
    if (bottleService.getCount(bottleId) < 1) return { success: false, reason: '你没有这个瓶子' };

    const basePrice = SELL_PRICES[bottle.rarity] || 50;
    const multiplier = status.prices[bottle.rarity] || 1.0;
    const finalPrice = Math.floor(basePrice * multiplier);

    bottleService.removeBottle(bottleId, 1);
    economyService.addCoins(finalPrice);
    return { success: true, bottle, price: finalPrice, multiplier };
  },

  isAvailable() {
    return !!getCurrentSession();
  },
};
