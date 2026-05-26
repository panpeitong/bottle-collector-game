import { getPlayer, savePlayer } from './dataAdapter.js';
import { MACHINES, getMachineById } from '../data/machines.js';
import { BOTTLES } from '../data/bottles.js';
import { bottleService } from './bottleService.js';
import { economyService } from './economyService.js';
import { weightedRandom, chance } from '../utils/random.js';
import { RARITY, AGAIN_ONE_PROB, PITY_COUNTS } from '../utils/constants.js';

const BASE_WEIGHTS = {
  [RARITY.COMMON]: 545,
  [RARITY.RARE]: 300,
  [RARITY.PRECIOUS]: 120,
  [RARITY.EPIC]: 30,
  [RARITY.LEGENDARY]: 5,
};

export const machineService = {
  getUnlockedMachines() {
    const p = getPlayer();
    return MACHINES.filter(m => p.machines.includes(m.id));
  },

  unlockMachine(machineId) {
    const p = getPlayer();
    const machine = getMachineById(machineId);
    if (!machine) return { success: false, reason: '贩卖机不存在' };
    if (p.machines.includes(machineId)) return { success: false, reason: '已解锁' };
    if (machine.unlockType === 'initial') return { success: false, reason: '初始贩卖机无需解锁' };

    if (machine.unlockType === 'coin') {
      if (p.coins < machine.unlockCost) {
        return { success: false, reason: `金币不足（需要 ${machine.unlockCost}）` };
      }
      p.coins -= machine.unlockCost;
      p.machines.push(machineId);
      savePlayer();
      return { success: true };
    }
    return { success: false, reason: '未知解锁方式' };
  },

  isUnlocked(machineId) {
    return getPlayer().machines.includes(machineId);
  },

  pull(machineId, times = 1) {
    const machine = getMachineById(machineId);
    if (!machine) return { success: false, reason: '贩卖机不存在' };
    if (!this.isUnlocked(machineId)) return { success: false, reason: '贩卖机未解锁' };

    const cost = times === 1 ? machine.pullCost : machine.pullTenCost;
    if (!economyService.spendCoins(cost)) {
      return { success: false, reason: `金币不足（需要 ${cost}）` };
    }

    const pool = BOTTLES.filter(machine.poolFilter);
    if (pool.length === 0) return { success: false, reason: '奖池为空' };

    const results = [];
    const newBottles = [];
    let gotAgainOne = false;

    for (let i = 0; i < times; i++) {
      const bottle = this._rollBottle(pool);
      if (!bottle) continue;

      const addResult = bottleService.addBottle(bottle.id);
      results.push(bottle);
      if (addResult.isNew) newBottles.push(bottle);

      if (chance(AGAIN_ONE_PROB)) {
        gotAgainOne = true;
        const extra = this._rollBottle(pool);
        if (extra) {
          const extraResult = bottleService.addBottle(extra.id);
          results.push(extra);
          if (extraResult.isNew) newBottles.push(extra);
        }
      }
    }

    savePlayer();
    return { success: true, bottles: results, cost, newBottles, againOne: gotAgainOne };
  },

  _rollBottle(pool) {
    const p = getPlayer();

    const byRarity = {};
    for (const b of pool) {
      if (!byRarity[b.rarity]) byRarity[b.rarity] = [];
      byRarity[b.rarity].push(b);
    }

    let targetRarity;
    if (p.pityCounts[5] >= PITY_COUNTS[5] - 1 && byRarity[5]) {
      targetRarity = 5;
      p.pityCounts[5] = 0;
    } else if (p.pityCounts[4] >= PITY_COUNTS[4] - 1 && byRarity[4]) {
      targetRarity = 4;
      p.pityCounts[4] = 0;
    } else if (p.pityCounts[3] >= PITY_COUNTS[3] - 1 && byRarity[3]) {
      targetRarity = 3;
      p.pityCounts[3] = 0;
    } else {
      const rarities = Object.keys(byRarity).map(Number).filter(r => byRarity[r].length > 0);
      const entries = rarities.map(r => ({ rarity: r, weight: BASE_WEIGHTS[r] || 0 }));
      if (entries.length === 0) return null;
      targetRarity = weightedRandom(entries, e => e.weight).rarity;
    }

    // 只清零当前稀有度，更高级别的保底继续累加
    for (var _r = 0; _r < [3, 4, 5].length; _r++) {
      var r = [3, 4, 5][_r];
      if (r === targetRarity) {
        p.pityCounts[r] = 0;
      } else if (r > targetRarity) {
        p.pityCounts[r] = Math.min((p.pityCounts[r] || 0) + 1, PITY_COUNTS[r] || 999);
      }
    }

    const candidates = byRarity[targetRarity];
    if (!candidates || candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  },
};
