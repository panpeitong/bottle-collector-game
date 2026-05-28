import { getPlayer, savePlayer } from './dataAdapter.js';
import { ACHIEVEMENTS, RARITY } from '../utils/constants.js';
import { BOTTLES } from '../data/bottles.js';
import { economyService } from './economyService.js';

export const achievementService = {
  /** Check all achievements after an action. Returns newly completed achievements. */
  check() {
    const p = getPlayer();
    var newlyCompleted = [];
    var ownedIds = Object.keys(p.bottles);
    var ownedCount = ownedIds.length;
    var achievements = p.achievements || {};

    // Helper
    function done(id) { return achievements[id] || false; }

    // Collector achievements
    if (!done('ach_collect_10') && ownedCount >= 10) { achievements['ach_collect_10'] = true; newlyCompleted.push('ach_collect_10'); }
    if (!done('ach_collect_20') && ownedCount >= 20) { achievements['ach_collect_20'] = true; newlyCompleted.push('ach_collect_20'); }
    if (!done('ach_collect_30') && ownedCount >= 30) { achievements['ach_collect_30'] = true; newlyCompleted.push('ach_collect_30'); }

    // Category completion
    var checkCat = function(catId, cat, expected) {
      var owned = BOTTLES.filter(function(b) { return b.category === cat && !b.limited && !b.synthesizable && ownedIds.indexOf(b.id) >= 0; }).length;
      if (!done(catId) && owned >= expected) { achievements[catId] = true; newlyCompleted.push(catId); }
    };
    checkCat('ach_all_soda', 'soda', 10);
    checkCat('ach_all_tea', 'tea', 8);
    checkCat('ach_all_coffee', 'coffee', 7);

    // Synthesizer
    if (!done('ach_synth_10') && (p.totalSynthCount || 0) >= 10) { achievements['ach_synth_10'] = true; newlyCompleted.push('ach_synth_10'); }
    if (!done('ach_first_recipe') && (p.discoveredRecipes || []).length >= 1) { achievements['ach_first_recipe'] = true; newlyCompleted.push('ach_first_recipe'); }
    if (!done('ach_all_recipes') && (p.discoveredRecipes || []).length >= 8) { achievements['ach_all_recipes'] = true; newlyCompleted.push('ach_all_recipes'); }

    // Tycoon
    if (!done('ach_earn_1000') && (p.totalEarnedCoins || 0) >= 1000) { achievements['ach_earn_1000'] = true; newlyCompleted.push('ach_earn_1000'); }
    if (!done('ach_sell_50') && (p.totalSoldBottles || 0) >= 50) { achievements['ach_sell_50'] = true; newlyCompleted.push('ach_sell_50'); }
    if (!done('ach_all_machines') && p.machines.length >= 4) { achievements['ach_all_machines'] = true; newlyCompleted.push('ach_all_machines'); }

    // Lucky
    if (!done('ach_first_legend')) {
      var hasLegend = Object.keys(p.bottles).some(function(id) {
        var b = BOTTLES.find(function(b2) { return b2.id === id; });
        return b && b.rarity === RARITY.LEGENDARY;
      });
      if (hasLegend) { achievements['ach_first_legend'] = true; newlyCompleted.push('ach_first_legend'); }
    }
    if (!done('ach_again_10') && (p.totalAgainOneCount || 0) >= 10) { achievements['ach_again_10'] = true; newlyCompleted.push('ach_again_10'); }

    // Hunter
    if (!done('ach_limited_5')) {
      var limitedOwned = BOTTLES.filter(function(b) { return b.limited && ownedIds.indexOf(b.id) >= 0; }).length;
      if (limitedOwned >= 5) { achievements['ach_limited_5'] = true; newlyCompleted.push('ach_limited_5'); }
    }

    // Save & reward
    if (newlyCompleted.length > 0) {
      p.achievements = achievements;
      savePlayer();
      // Grant rewards for newly completed
      for (var i = 0; i < newlyCompleted.length; i++) {
        var ach = ACHIEVEMENTS.find(function(a) { return a.id === newlyCompleted[i]; });
        if (ach && ach.reward) {
          if (ach.reward.coins) economyService.addCoins(ach.reward.coins);
          if (ach.reward.ticket) {
            if (!p.pityTickets) p.pityTickets = { rare: 0, precious: 0, epic: 0 };
            p.pityTickets[ach.reward.ticket] = (p.pityTickets[ach.reward.ticket] || 0) + 1;
          }
        }
      }
    }
    return newlyCompleted;
  },

  /** Get all achievements with their status */
  getAll() {
    const p = getPlayer();
    return ACHIEVEMENTS.map(function(ach) {
      var completed = !!(p.achievements || {})[ach.id];
      var progress = 0;
      if (!completed) {
        if (ach.id.startsWith('ach_collect')) progress = Object.keys(p.bottles).length;
        else if (ach.id === 'ach_all_soda') progress = BOTTLES.filter(function(b) { return b.category === 'soda' && !b.limited && !b.synthesizable && p.bottles[b.id]; }).length;
        else if (ach.id === 'ach_all_tea') progress = BOTTLES.filter(function(b) { return b.category === 'tea' && !b.limited && !b.synthesizable && p.bottles[b.id]; }).length;
        else if (ach.id === 'ach_all_coffee') progress = BOTTLES.filter(function(b) { return b.category === 'coffee' && !b.limited && !b.synthesizable && p.bottles[b.id]; }).length;
        else if (ach.id === 'ach_synth_10') progress = p.totalSynthCount || 0;
        else if (ach.id === 'ach_first_recipe') progress = (p.discoveredRecipes || []).length;
        else if (ach.id === 'ach_all_recipes') progress = (p.discoveredRecipes || []).length;
        else if (ach.id === 'ach_earn_1000') progress = p.totalEarnedCoins || 0;
        else if (ach.id === 'ach_sell_50') progress = p.totalSoldBottles || 0;
        else if (ach.id === 'ach_all_machines') progress = p.machines.length;
        else if (ach.id === 'ach_first_legend') {
          progress = Object.keys(p.bottles).some(function(id) {
            var b = BOTTLES.find(function(b2) { return b2.id === id; });
            return b && b.rarity === RARITY.LEGENDARY;
          }) ? 1 : 0;
        } else if (ach.id === 'ach_again_10') progress = p.totalAgainOneCount || 0;
        else if (ach.id === 'ach_limited_5') progress = BOTTLES.filter(function(b) { return b.limited && p.bottles[b.id]; }).length;
      }
      return {
        ...ach,
        completed: completed,
        progress: completed ? ach.target : progress,
        target: ach.target,
        pct: completed ? 100 : Math.round(Math.min(progress / ach.target, 1) * 100),
      };
    });
  },
};
