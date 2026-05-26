import { BOTTLES } from '../data/bottles.js';
import { bottleService } from './bottleService.js';
import { economyService } from './economyService.js';
import { SYNTH_COSTS } from '../utils/constants.js';

export const synthService = {
  synthUpgrade(bottleId) {
    const source = BOTTLES.find(b => b.id === bottleId);
    if (!source) return { success: false, reason: '瓶子不存在' };
    if (source.limited) return { success: false, reason: '限定瓶不可用于合成' };
    if (bottleService.getCount(bottleId) < 3) return { success: false, reason: '需要3个相同瓶子' };
    if (source.rarity >= 5) return { success: false, reason: '传说已是最高稀有度' };

    const targetRarity = source.rarity + 1;
    const cost = SYNTH_COSTS[source.rarity] || 200;
    
    // 先检查候选池，避免扣了材料发现没法合成
    var candidates = BOTTLES.filter(function(b) { return b.rarity === targetRarity && !b.limited; });
    if (candidates.length === 0) return { success: false, reason: '没有可合成的目标瓶子' };

    // 先扣材料再扣金币（材料是实打实的消耗，金币可能不足）
    if (!bottleService.removeBottle(bottleId, 3)) {
      return { success: false, reason: '材料不足' };
    }
    if (!economyService.spendCoins(cost)) {
      // 退款：把材料加回去
      bottleService.addBottle(bottleId);
      bottleService.addBottle(bottleId);
      bottleService.addBottle(bottleId);
      return { success: false, reason: '金币不足（需要 ' + cost + '）' };
    }

    var newBottle = candidates[Math.floor(Math.random() * candidates.length)];
    bottleService.addBottle(newBottle.id);

    return { success: true, newBottle: newBottle, cost: cost };
  },

  blindBoxPull() {
    if (!bottleService.checkBlindBox()) return { success: false, reason: '暂无盲抽资格' };

    bottleService.useBlindBox();

    const pool = BOTTLES.filter(b => b.rarity >= 3);
    if (pool.length === 0) return { success: false, reason: '奖池为空' };

    const bottle = pool[Math.floor(Math.random() * pool.length)];
    bottleService.addBottle(bottle.id);

    return { success: true, newBottle: bottle };
  },
};
