import { getPlayer, savePlayer } from './dataAdapter.js';
import { MACHINES, getMachineById } from '../data/machines.js';
import { BOTTLES } from '../data/bottles.js';
import { bottleService } from './bottleService.js';
import { economyService } from './economyService.js';
import { weightedRandom, chance } from '../utils/random.js';
import {
  RARITY, AGAIN_ONE_PROB, PITY_COUNTS,
  LIMITED_COOLDOWN_MS, LIMITED_COOLING_PULLS, LIMITED_PULL_WINDOW_MS,
  LUCKY_POINTS_MAX
} from '../utils/constants.js';

const BASE_WEIGHTS = { [RARITY.COMMON]: 545, [RARITY.RARE]: 300, [RARITY.PRECIOUS]: 120, [RARITY.EPIC]: 30, [RARITY.LEGENDARY]: 5 };

export const machineService = {
  getUnlockedMachines() {
    return MACHINES.filter(m => getPlayer().machines.includes(m.id));
  },

  unlockMachine(machineId) {
    const p = getPlayer();
    const machine = getMachineById(machineId);
    if (!machine) return { success: false, reason: '贩卖机不存在' };
    if (p.machines.includes(machineId)) return { success: false, reason: '已解锁' };
    if (machine.unlockType === 'initial') return { success: false, reason: '初始贩卖机无需解锁' };
    if (machine.unlockType === 'coin') {
      if (p.coins < machine.unlockCost) return { success: false, reason: '金币不足（需要 ' + machine.unlockCost + '）' };
      p.coins -= machine.unlockCost;
      p.machines.push(machineId);
      savePlayer();
      return { success: true };
    }
    return { success: false, reason: '未知解锁方式' };
  },

  isUnlocked(machineId) { return getPlayer().machines.includes(machineId); },

  getLimitedCooldown() {
    const p = getPlayer();
    const now = Date.now();
    const lastPull = p.lastLimitedPull || 0;
    const remaining = p.coolingPullRemaining || 0;
    if (remaining > 0 && (now - lastPull) < LIMITED_PULL_WINDOW_MS) return { canPull: true, cooling: false, remaining: 0, pullsLeft: remaining };
    const elapsed = now - lastPull;
    if (elapsed >= LIMITED_COOLDOWN_MS) {
      p.lastLimitedPull = now; p.coolingPullRemaining = LIMITED_COOLING_PULLS; savePlayer();
      return { canPull: true, cooling: false, remaining: 0, pullsLeft: LIMITED_COOLING_PULLS };
    }
    return { canPull: false, cooling: true, remaining: LIMITED_COOLDOWN_MS - elapsed, pullsLeft: 0 };
  },

  _consumeLimitedPull() {
    const p = getPlayer();
    p.coolingPullRemaining = Math.max(0, (p.coolingPullRemaining || 0) - 1);
    p.lastLimitedPull = Date.now();
    savePlayer();
  },

  pull(machineId, times) {
    times = times || 1;
    const machine = getMachineById(machineId);
    if (!machine) return { success: false, reason: '贩卖机不存在' };
    if (!this.isUnlocked(machineId)) return { success: false, reason: '贩卖机未解锁' };
    if (machineId === 'vm_limited') {
      const cd = this.getLimitedCooldown();
      if (!cd.canPull) return { success: false, reason: '冷却中', cooldown: cd.remaining };
      if (times > cd.pullsLeft) return { success: false, reason: '剩余抽取次数不足（剩余 ' + cd.pullsLeft + ' 次）', pullsLeft: cd.pullsLeft };
    }
    const cost = times === 1 ? machine.pullCost : machine.pullTenCost;
    if (!economyService.spendCoins(cost)) return { success: false, reason: '金币不足（需要 ' + cost + '）' };
    const pool = BOTTLES.filter(machine.poolFilter);
    if (pool.length === 0) return { success: false, reason: '奖池为空' };
    const results = []; const newBottles = []; let gotAgainOne = false; let milestoneTriggered = null;
    const p = getPlayer();
    p.totalPulls = (p.totalPulls || 0) + times;

    for (let i = 0; i < times; i++) {
      const bottle = this._rollBottle(pool);
      if (!bottle) continue;
      const addResult = bottleService.addBottle(bottle.id);
      results.push(bottle);
      if (addResult.isNew) newBottles.push(bottle);
      if (addResult.milestone) milestoneTriggered = addResult.milestone;
      if (chance(AGAIN_ONE_PROB)) {
        gotAgainOne = true;
        const extra = this._rollBottle(pool);
        if (extra) {
          const extraResult = bottleService.addBottle(extra.id);
          results.push(extra);
          if (extraResult.isNew) newBottles.push(extra);
          if (extraResult.milestone) milestoneTriggered = extraResult.milestone;
          p.totalAgainOneCount = (p.totalAgainOneCount || 0) + 1;
        }
      }
    }
    if (machineId === 'vm_limited') this._consumeLimitedPull();
    savePlayer();
    return { success: true, bottles: results, cost, newBottles, againOne: gotAgainOne, milestone: milestoneTriggered };
  },

  _rollBottle(pool) {
    const p = getPlayer();
    const byRarity = {};
    for (const b of pool) { if (!byRarity[b.rarity]) byRarity[b.rarity] = []; byRarity[b.rarity].push(b); }
    let guaranteedRarity = 0;
    if (p.pityTickets) {
      if (p.pityTickets.epic > 0) { guaranteedRarity = RARITY.EPIC; p.pityTickets.epic--; }
      else if (p.pityTickets.precious > 0) { guaranteedRarity = RARITY.PRECIOUS; p.pityTickets.precious--; }
      else if (p.pityTickets.rare > 0) { guaranteedRarity = RARITY.RARE; p.pityTickets.rare--; }
    }
    if (guaranteedRarity === 0 && p.luckyPoints >= LUCKY_POINTS_MAX) { guaranteedRarity = RARITY.RARE; p.luckyPoints = 0; }
    let targetRarity;
    if (guaranteedRarity > 0 && byRarity[guaranteedRarity]) {
      targetRarity = guaranteedRarity;
    } else if (p.pityCounts[5] >= PITY_COUNTS[5] - 1 && byRarity[5]) { targetRarity = 5; p.pityCounts[5] = 0; }
    else if (p.pityCounts[4] >= PITY_COUNTS[4] - 1 && byRarity[4]) { targetRarity = 4; p.pityCounts[4] = 0; }
    else if (p.pityCounts[3] >= PITY_COUNTS[3] - 1 && byRarity[3]) { targetRarity = 3; p.pityCounts[3] = 0; }
    else {
      const rarities = Object.keys(byRarity).map(Number).filter(r => byRarity[r].length > 0);
      const entries = rarities.map(r => ({ rarity: r, weight: BASE_WEIGHTS[r] || 0 }));
      if (entries.length === 0) return null;
      targetRarity = weightedRandom(entries, e => e.weight).rarity;
    }
    [3, 4, 5].forEach(function(r) {
      if (r === targetRarity) p.pityCounts[r] = 0;
      else if (r > targetRarity) p.pityCounts[r] = Math.min((p.pityCounts[r] || 0) + 1, PITY_COUNTS[r] || 999);
    });
    const candidates = byRarity[targetRarity];
    if (!candidates || candidates.length === 0) return null;
    var picked = candidates[Math.floor(Math.random() * candidates.length)];
    if (!guaranteedRarity && p.bottles[picked.id]) p.luckyPoints = (p.luckyPoints || 0) + 1;
    return picked;
  },

  getLuckyProgress() { return Math.min(getPlayer().luckyPoints || 0, LUCKY_POINTS_MAX); },
};
