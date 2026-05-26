import { RARITY } from '../utils/constants.js';

export const BOTTLES = [
  // === 汽水类 (soda) ===
  { id: 'cola_001', name: '经典可乐', rarity: RARITY.COMMON, category: 'soda', spriteColor: '#E53935', shape: 'can', limited: false, season: null },
  { id: 'cola_002', name: '零度可乐', rarity: RARITY.COMMON, category: 'soda', spriteColor: '#212121', shape: 'can', limited: false, season: null },
  { id: 'spr_001', name: '雪碧', rarity: RARITY.COMMON, category: 'soda', spriteColor: '#4CAF50', shape: 'can', limited: false, season: null },
  { id: 'fnt_001', name: '芬达橙', rarity: RARITY.COMMON, category: 'soda', spriteColor: '#FF9800', shape: 'can', limited: false, season: null },
  { id: 'fnt_002', name: '芬达葡萄', rarity: RARITY.COMMON, category: 'soda', spriteColor: '#9C27B0', shape: 'can', limited: false, season: null },
  { id: 'mtn_001', name: '激浪', rarity: RARITY.RARE, category: 'soda', spriteColor: '#00BCD4', shape: 'can', limited: false, season: null },
  { id: 'drp_001', name: '胡椒博士', rarity: RARITY.RARE, category: 'soda', spriteColor: '#795548', shape: 'can', limited: false, season: null },
  { id: 'cher_001', name: '樱桃可乐', rarity: RARITY.PRECIOUS, category: 'soda', spriteColor: '#C62828', shape: 'glass', limited: false, season: null },
  { id: 'crys_001', name: '水晶可乐', rarity: RARITY.EPIC, category: 'soda', spriteColor: '#E0F7FA', shape: 'glass', limited: false, season: null },
  { id: 'gold_001', name: '黄金可乐', rarity: RARITY.LEGENDARY, category: 'soda', spriteColor: '#FFD700', shape: 'can', limited: false, season: null },

  // === 茶饮类 (tea) ===
  { id: 'tea_001', name: '绿茶', rarity: RARITY.COMMON, category: 'tea', spriteColor: '#81C784', shape: 'bottle', limited: false, season: null },
  { id: 'tea_002', name: '红茶', rarity: RARITY.COMMON, category: 'tea', spriteColor: '#A1887F', shape: 'bottle', limited: false, season: null },
  { id: 'tea_003', name: '乌龙茶', rarity: RARITY.COMMON, category: 'tea', spriteColor: '#8D6E63', shape: 'bottle', limited: false, season: null },
  { id: 'tea_004', name: '茉莉花茶', rarity: RARITY.RARE, category: 'tea', spriteColor: '#C5E1A5', shape: 'bottle', limited: false, season: null },
  { id: 'tea_005', name: '抹茶', rarity: RARITY.RARE, category: 'tea', spriteColor: '#66BB6A', shape: 'bottle', limited: false, season: null },
  { id: 'tea_006', name: '大红袍', rarity: RARITY.PRECIOUS, category: 'tea', spriteColor: '#5D4037', shape: 'bottle', limited: false, season: null },
  { id: 'tea_007', name: '龙井', rarity: RARITY.EPIC, category: 'tea', spriteColor: '#33691E', shape: 'bottle', limited: false, season: null },
  { id: 'tea_008', name: '普洱金砖', rarity: RARITY.LEGENDARY, category: 'tea', spriteColor: '#795548', shape: 'bottle', limited: false, season: null },

  // === 咖啡类 (coffee) ===
  { id: 'cof_001', name: '美式咖啡', rarity: RARITY.COMMON, category: 'coffee', spriteColor: '#3E2723', shape: 'cup', limited: false, season: null },
  { id: 'cof_002', name: '拿铁', rarity: RARITY.COMMON, category: 'coffee', spriteColor: '#D7CCC8', shape: 'cup', limited: false, season: null },
  { id: 'cof_003', name: '卡布奇诺', rarity: RARITY.RARE, category: 'coffee', spriteColor: '#BCAAA4', shape: 'cup', limited: false, season: null },
  { id: 'cof_004', name: '摩卡', rarity: RARITY.RARE, category: 'coffee', spriteColor: '#4E342E', shape: 'cup', limited: false, season: null },
  { id: 'cof_005', name: '冷萃咖啡', rarity: RARITY.PRECIOUS, category: 'coffee', spriteColor: '#1B5E20', shape: 'glass', limited: false, season: null },
  { id: 'cof_006', name: '蓝山咖啡', rarity: RARITY.EPIC, category: 'coffee', spriteColor: '#004D40', shape: 'cup', limited: false, season: null },
  { id: 'cof_007', name: '猫屎咖啡', rarity: RARITY.LEGENDARY, category: 'coffee', spriteColor: '#000000', shape: 'cup', limited: false, season: null },

];

export function getBottleById(id) {
  return BOTTLES.find(b => b.id === id);
}

export function getBottlesByCategory(cat) {
  return BOTTLES.filter(b => b.category === cat);
}

export function getLimitedBottles() {
  return BOTTLES.filter(b => b.limited);
}
