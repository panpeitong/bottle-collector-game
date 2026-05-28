export const RARITY = {
  COMMON: 1,
  RARE: 2,
  PRECIOUS: 3,
  EPIC: 4,
  LEGENDARY: 5,
};

export const RARITY_NAMES = {
  [RARITY.COMMON]: '普通 ⭐',
  [RARITY.RARE]: '稀有 ⭐⭐',
  [RARITY.PRECIOUS]: '珍贵 ⭐⭐⭐',
  [RARITY.EPIC]: '史诗 ⭐⭐⭐⭐',
  [RARITY.LEGENDARY]: '传说 ⭐⭐⭐⭐⭐',
};

export const RARITY_COLORS = {
  [RARITY.COMMON]: '#9E9E9E',
  [RARITY.RARE]: '#4CAF50',
  [RARITY.PRECIOUS]: '#2196F3',
  [RARITY.EPIC]: '#9C27B0',
  [RARITY.LEGENDARY]: '#FF9800',
};

export const PULL_COST = 10;
export const PULL_TEN_COST = 90;
export const AGAIN_ONE_PROB = 0.08;
export const BLIND_BOX_THRESHOLD = 30;
export const SYNTH_COSTS = { 1: 10, 2: 30, 3: 80, 4: 200 };
export const SELL_PRICES = { 1: 3, 2: 8, 3: 25, 4: 80, 5: 300 };
export const PITY_COUNTS = { 3: 15, 4: 50, 5: 200 };
export const NEWBIE_COINS = 200;
export const DAILY_SIGN_COINS = 100;
export const CONSECUTIVE_3_BONUS = 15;
export const CONSECUTIVE_7_BONUS = 50;
export const LIMITED_COOLDOWN_MS = 4 * 60 * 60 * 1000;
export const LIMITED_COOLING_PULLS = 3;
export const LIMITED_PULL_WINDOW_MS = 60 * 60 * 1000;
export const LUCKY_POINTS_MAX = 100;
export const SPRITE_SIZE = 64;

export const COLLECTION_MILESTONES = [
  { count: 5, reward: { coins: 50 } },
  { count: 10, reward: { coins: 100 } },
  { count: 15, reward: { ticket: 'rare', label: '稀有保底券' } },
  { count: 20, reward: { coins: 200 } },
  { count: 25, reward: { ticket: 'precious', label: '珍贵保底券' } },
  { count: 30, reward: { coins: 400 } },
  { count: 40, reward: { ticket: 'epic', label: '史诗保底券' } },
];

export const ACHIEVEMENTS = [
  { id: 'ach_collect_10', category: 'collector', name: '初级收藏家', desc: '收集10种不同瓶子', target: 10, reward: { coins: 20 }, icon: '📦' },
  { id: 'ach_collect_20', category: 'collector', name: '中级收藏家', desc: '收集20种不同瓶子', target: 20, reward: { coins: 50 }, icon: '📚' },
  { id: 'ach_collect_30', category: 'collector', name: '高级收藏家', desc: '收集30种不同瓶子', target: 30, reward: { ticket: 'rare' }, icon: '🏆' },
  { id: 'ach_all_soda', category: 'collector', name: '汽水大师', desc: '集齐所有汽水类瓶子', target: 10, reward: { coins: 50 }, icon: '🥤' },
  { id: 'ach_all_tea', category: 'collector', name: '茶道传人', desc: '集齐所有茶饮类瓶子', target: 8, reward: { coins: 50 }, icon: '🍵' },
  { id: 'ach_all_coffee', category: 'collector', name: '咖啡达人', desc: '集齐所有咖啡类瓶子', target: 7, reward: { coins: 50 }, icon: '☕' },
  { id: 'ach_synth_10', category: 'synthesizer', name: '合成新手', desc: '完成10次三合一合成', target: 10, reward: { coins: 30 }, icon: '⚗️' },
  { id: 'ach_first_recipe', category: 'synthesizer', name: '配方破译者', desc: '首次完成配方合成', target: 1, reward: { ticket: 'precious' }, icon: '🔮' },
  { id: 'ach_all_recipes', category: 'synthesizer', name: '配方大师', desc: '完成全部8个配方', target: 8, reward: { ticket: 'epic' }, icon: '🌟' },
  { id: 'ach_earn_1000', category: 'tycoon', name: '小财主', desc: '累计获得1000金币', target: 1000, reward: { coins: 100 }, icon: '💰' },
  { id: 'ach_sell_50', category: 'tycoon', name: '精明商人', desc: '累计卖出50瓶', target: 50, reward: { coins: 50 }, icon: '💼' },
  { id: 'ach_all_machines', category: 'tycoon', name: '贩卖机之王', desc: '解锁全部贩卖机', target: 4, reward: { coins: 100 }, icon: '🏪' },
  { id: 'ach_first_legend', category: 'lucky', name: '欧皇降临', desc: '抽到第一张传说瓶', target: 1, reward: { ticket: 'rare' }, icon: '👑' },
  { id: 'ach_again_10', category: 'lucky', name: '再来一瓶！', desc: '累计触发再来一瓶10次', target: 10, reward: { coins: 30 }, icon: '🎫' },
  { id: 'ach_limited_5', category: 'hunter', name: '限定猎人', desc: '收集5种限定瓶', target: 5, reward: { ticket: 'precious' }, icon: '💎' },
];

// 响应式断点
export const BP_SMALL = 375;
export const BP_MEDIUM = 480;
export const BP_LARGE = 768;
export const BP_XLARGE = 1024;
