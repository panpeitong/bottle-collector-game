import { BOTTLES } from '../data/bottles.js';
import { findRecipeByInputs } from '../data/recipes.js';
import { bottleService } from './bottleService.js';
import { economyService } from './economyService.js';
import { getPlayer, savePlayer } from './dataAdapter.js';
import { SYNTH_COSTS } from '../utils/constants.js';

export const synthService = {
  synthUpgrade(materialIds) {
    if (!materialIds || materialIds.length !== 3) return { success: false, reason: '需要恰好3个瓶子作为材料' };
    var unique = [];
    for (var i = 0; i < materialIds.length; i++) { if (unique.indexOf(materialIds[i]) === -1) unique.push(materialIds[i]); }
    if (unique.length < 3) return { success: false, reason: '需要3种不同的瓶子' };
    var materials = [];
    for (var j = 0; j < unique.length; j++) {
      var bottle = BOTTLES.find(function(b) { return b.id === unique[j]; });
      if (!bottle) return { success: false, reason: '瓶子不存在' };
      if (bottle.limited) return { success: false, reason: '「' + bottle.name + '」是限定瓶，不可合成' };
      if (bottle.noSynth) return { success: false, reason: '「' + bottle.name + '」不可作为材料' };
      if (bottle.rarity >= 5) return { success: false, reason: '「' + bottle.name + '」已是传说最高稀有度' };
      if (bottleService.getCount(unique[j]) < 1) return { success: false, reason: '「' + bottle.name + '」数量不足' };
      materials.push(bottle);
    }
    var rarity = materials[0].rarity;
    for (var k = 1; k < materials.length; k++) { if (materials[k].rarity !== rarity) return { success: false, reason: '材料瓶稀有度必须一致' }; }
    var targetRarity = rarity + 1;
    var cost = SYNTH_COSTS[rarity] || 200;
    var candidates = BOTTLES.filter(function(b) { return b.rarity === targetRarity && !b.limited && !b.synthesizable; });
    if (candidates.length === 0) return { success: false, reason: '没有可合成的目标瓶子' };
    for (var m = 0; m < materials.length; m++) {
      if (!bottleService.removeBottle(materials[m].id, 1)) {
        for (var rb = 0; rb < m; rb++) bottleService.addBottle(materials[rb].id);
        return { success: false, reason: '材料扣除失败' };
      }
    }
    if (!economyService.spendCoins(cost)) {
      for (var rf = 0; rf < materials.length; rf++) bottleService.addBottle(materials[rf].id);
      return { success: false, reason: '金币不足（需要 ' + cost + '）' };
    }
    var newBottle = candidates[Math.floor(Math.random() * candidates.length)];
    bottleService.addBottle(newBottle.id);
    var p = getPlayer();
    p.totalSynthCount = (p.totalSynthCount || 0) + 1;
    savePlayer();
    return { success: true, newBottle: newBottle, cost: cost, isRecipe: false };
  },

  synthRecipe(materialIds) {
    var unique = [];
    for (var i = 0; i < materialIds.length; i++) { if (unique.indexOf(materialIds[i]) === -1) unique.push(materialIds[i]); }
    var recipe = findRecipeByInputs(unique);
    if (!recipe) return { success: false, reason: '配方不匹配，尝试其他组合吧' };
    for (var j = 0; j < recipe.inputs.length; j++) {
      if (bottleService.getCount(recipe.inputs[j]) < 1) return { success: false, reason: '材料不足' };
    }
    for (var k = 0; k < recipe.inputs.length; k++) {
      if (!bottleService.removeBottle(recipe.inputs[k], 1)) {
        for (var rb = 0; rb < k; rb++) bottleService.addBottle(recipe.inputs[rb]);
        return { success: false, reason: '材料扣除失败' };
      }
    }
    var outputBottle = BOTTLES.find(function(b) { return b.id === recipe.output; });
    if (!outputBottle) return { success: false, reason: '配方产出瓶不存在' };
    bottleService.addBottle(outputBottle.id);
    var p = getPlayer();
    if (!p.discoveredRecipes) p.discoveredRecipes = [];
    if (p.discoveredRecipes.indexOf(recipe.id) === -1) p.discoveredRecipes.push(recipe.id);
    savePlayer();
    return { success: true, newBottle: outputBottle, cost: 0, isRecipe: true, recipeId: recipe.id, recipeName: recipe.name };
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

  getSynthMaterialsByRarity(rarity) {
    return bottleService.getInventory().filter(function(item) {
      return item.bottle.rarity === rarity && !item.bottle.limited && !item.bottle.noSynth && item.bottle.rarity < 5 && item.count >= 1;
    });
  },
};
