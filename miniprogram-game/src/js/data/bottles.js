import { RARITY } from '../utils/constants.js';

export const BOTTLES = [
  // === 汽水类 (soda) ===
  { id: 'cola_001', name: '经典可乐', rarity: RARITY.COMMON, category: 'soda', spriteColor: '#E53935', shape: 'can', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'cola_002', name: '零度可乐', rarity: RARITY.COMMON, category: 'soda', spriteColor: '#212121', shape: 'can', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'spr_001', name: '雪碧', rarity: RARITY.COMMON, category: 'soda', spriteColor: '#4CAF50', shape: 'can', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'fnt_001', name: '芬达橙', rarity: RARITY.COMMON, category: 'soda', spriteColor: '#FF9800', shape: 'can', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'fnt_002', name: '芬达葡萄', rarity: RARITY.COMMON, category: 'soda', spriteColor: '#9C27B0', shape: 'can', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'mtn_001', name: '激浪', rarity: RARITY.RARE, category: 'soda', spriteColor: '#00BCD4', shape: 'can', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'drp_001', name: '胡椒博士', rarity: RARITY.RARE, category: 'soda', spriteColor: '#795548', shape: 'can', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'cher_001', name: '樱桃可乐', rarity: RARITY.PRECIOUS, category: 'soda', spriteColor: '#C62828', shape: 'glass', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'crys_001', name: '水晶可乐', rarity: RARITY.EPIC, category: 'soda', spriteColor: '#E0F7FA', shape: 'glass', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'gold_001', name: '黄金可乐', rarity: RARITY.LEGENDARY, category: 'soda', spriteColor: '#FFD700', shape: 'can', limited: false, season: null, synthesizable: false, noSynth: false },

  // === 茶饮类 (tea) ===
  { id: 'tea_001', name: '绿茶', rarity: RARITY.COMMON, category: 'tea', spriteColor: '#81C784', shape: 'bottle', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'tea_002', name: '红茶', rarity: RARITY.COMMON, category: 'tea', spriteColor: '#A1887F', shape: 'bottle', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'tea_003', name: '乌龙茶', rarity: RARITY.COMMON, category: 'tea', spriteColor: '#8D6E63', shape: 'bottle', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'tea_004', name: '茉莉花茶', rarity: RARITY.RARE, category: 'tea', spriteColor: '#C5E1A5', shape: 'bottle', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'tea_005', name: '抹茶', rarity: RARITY.RARE, category: 'tea', spriteColor: '#66BB6A', shape: 'bottle', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'tea_006', name: '大红袍', rarity: RARITY.PRECIOUS, category: 'tea', spriteColor: '#5D4037', shape: 'bottle', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'tea_007', name: '龙井', rarity: RARITY.EPIC, category: 'tea', spriteColor: '#33691E', shape: 'bottle', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'tea_008', name: '普洱金砖', rarity: RARITY.LEGENDARY, category: 'tea', spriteColor: '#795548', shape: 'bottle', limited: false, season: null, synthesizable: false, noSynth: false },

  // === 咖啡类 (coffee) ===
  { id: 'cof_001', name: '美式咖啡', rarity: RARITY.COMMON, category: 'coffee', spriteColor: '#3E2723', shape: 'cup', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'cof_002', name: '拿铁', rarity: RARITY.COMMON, category: 'coffee', spriteColor: '#D7CCC8', shape: 'cup', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'cof_003', name: '卡布奇诺', rarity: RARITY.RARE, category: 'coffee', spriteColor: '#BCAAA4', shape: 'cup', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'cof_004', name: '摩卡', rarity: RARITY.RARE, category: 'coffee', spriteColor: '#4E342E', shape: 'cup', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'cof_005', name: '冷萃咖啡', rarity: RARITY.PRECIOUS, category: 'coffee', spriteColor: '#1B5E20', shape: 'glass', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'cof_006', name: '蓝山咖啡', rarity: RARITY.EPIC, category: 'coffee', spriteColor: '#004D40', shape: 'cup', limited: false, season: null, synthesizable: false, noSynth: false },
  { id: 'cof_007', name: '猫屎咖啡', rarity: RARITY.LEGENDARY, category: 'coffee', spriteColor: '#000000', shape: 'cup', limited: false, season: null, synthesizable: false, noSynth: false },

  // === 限定瓶 ===
  { id: 'lim_sakura', name: '樱花汽水', rarity: RARITY.PRECIOUS, category: 'soda', spriteColor: '#FFB7C5', shape: 'glass', limited: true, season: 'spring', synthesizable: false, noSynth: false },
  { id: 'lim_matcha_latte', name: '抹茶拿铁', rarity: RARITY.PRECIOUS, category: 'coffee', spriteColor: '#A5D6A7', shape: 'cup', limited: true, season: 'spring', synthesizable: false, noSynth: false },
  { id: 'lim_watermelon', name: '西瓜特饮', rarity: RARITY.PRECIOUS, category: 'soda', spriteColor: '#FF5252', shape: 'glass', limited: true, season: 'summer', synthesizable: false, noSynth: false },
  { id: 'lim_coconut', name: '椰子冰咖', rarity: RARITY.PRECIOUS, category: 'coffee', spriteColor: '#FFF8E1', shape: 'cup', limited: true, season: 'summer', synthesizable: false, noSynth: false },
  { id: 'lim_pumpkin', name: '南瓜拿铁', rarity: RARITY.EPIC, category: 'coffee', spriteColor: '#FF8F00', shape: 'cup', limited: true, season: 'autumn', synthesizable: false, noSynth: false },
  { id: 'lim_osmanthus', name: '桂花茶', rarity: RARITY.EPIC, category: 'tea', spriteColor: '#FFD54F', shape: 'bottle', limited: true, season: 'autumn', synthesizable: false, noSynth: false },
  { id: 'lim_gingerbread', name: '姜饼可可', rarity: RARITY.EPIC, category: 'coffee', spriteColor: '#8D6E63', shape: 'cup', limited: true, season: 'winter', synthesizable: false, noSynth: false },
  { id: 'lim_winter_tea', name: '暖冬奶茶', rarity: RARITY.EPIC, category: 'tea', spriteColor: '#FFCCBC', shape: 'cup', limited: true, season: 'winter', synthesizable: false, noSynth: false },
  { id: 'lim_xmas_cola', name: '圣诞可乐', rarity: RARITY.EPIC, category: 'soda', spriteColor: '#C62828', shape: 'can', limited: true, season: 'holiday', synthesizable: false, noSynth: false },
  { id: 'lim_halloween', name: '万圣南瓜汁', rarity: RARITY.LEGENDARY, category: 'soda', spriteColor: '#FF6F00', shape: 'glass', limited: true, season: 'holiday', synthesizable: false, noSynth: false },
  { id: 'lim_aurora', name: '极光苏打', rarity: RARITY.LEGENDARY, category: 'soda', spriteColor: '#00E5FF', shape: 'glass', limited: true, season: 'collab', synthesizable: false, noSynth: false },
  { id: 'lim_rainbow', name: '彩虹汽水', rarity: RARITY.LEGENDARY, category: 'soda', spriteColor: '#E040FB', shape: 'can', limited: true, season: 'collab', synthesizable: false, noSynth: false },

  // === 配方产出瓶 (synthesizable, 不在贩卖机池) ===
  { id: 'rec_family_bucket', name: '全家桶特饮', rarity: RARITY.EPIC, category: 'soda', spriteColor: '#FF5722', shape: 'tetra', limited: false, season: null, synthesizable: true, noSynth: true },
  { id: 'rec_tea_ceremony', name: '功夫茶道', rarity: RARITY.EPIC, category: 'tea', spriteColor: '#2E7D32', shape: 'bottle', limited: false, season: null, synthesizable: true, noSynth: true },
  { id: 'rec_coffee_blend', name: '精品拼配', rarity: RARITY.EPIC, category: 'coffee', spriteColor: '#4E342E', shape: 'cup', limited: false, season: null, synthesizable: true, noSynth: true },
  { id: 'rec_crossover', name: '跨界特调', rarity: RARITY.LEGENDARY, category: 'soda', spriteColor: '#E040FB', shape: 'glass', limited: false, season: null, synthesizable: true, noSynth: true },
  { id: 'rec_ice_fire', name: '冰火特饮', rarity: RARITY.EPIC, category: 'soda', spriteColor: '#FF7043', shape: 'glass', limited: false, season: null, synthesizable: true, noSynth: true },
  { id: 'rec_trio', name: '三重奏', rarity: RARITY.PRECIOUS, category: 'tea', spriteColor: '#7E57C2', shape: 'bottle', limited: false, season: null, synthesizable: true, noSynth: true },
  { id: 'rec_spring_elixir', name: '春之甘露', rarity: RARITY.LEGENDARY, category: 'tea', spriteColor: '#80DEEA', shape: 'glass', limited: false, season: null, synthesizable: true, noSynth: true },
  { id: 'rec_four_seasons', name: '四季精华', rarity: RARITY.LEGENDARY, category: 'soda', spriteColor: '#FFF176', shape: 'tetra', limited: false, season: null, synthesizable: true, noSynth: true },
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
