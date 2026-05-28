export const RECIPES = [
  {
    id: 'rec_family_bucket',
    name: '全家桶特饮',
    inputs: ['cola_001', 'spr_001', 'fnt_001'],
    output: 'rec_family_bucket',
    hint: '三种汽水聚在一起会产生奇妙的反应…',
    discovered: false,
  },
  {
    id: 'rec_tea_ceremony',
    name: '功夫茶道',
    inputs: ['tea_001', 'tea_002', 'tea_003'],
    output: 'rec_tea_ceremony',
    hint: '绿茶、红茶、乌龙，三盏齐聚便是茶道真谛。',
    discovered: false,
  },
  {
    id: 'rec_coffee_blend',
    name: '精品拼配',
    inputs: ['cof_001', 'cof_002', 'cof_003'],
    output: 'rec_coffee_blend',
    hint: '美式、拿铁、卡布奇诺——咖啡三剑客的完美融合。',
    discovered: false,
  },
  {
    id: 'rec_crossover',
    name: '跨界特调',
    inputs: ['cola_001', 'tea_005', 'cof_004'],
    output: 'rec_crossover',
    hint: '可乐的刺激、抹茶的清苦、摩卡的浓郁…敢试试吗？',
    discovered: false,
  },
  {
    id: 'rec_ice_fire',
    name: '冰火特饮',
    inputs: ['cola_002', 'cof_002'],
    output: 'rec_ice_fire',
    hint: '冰与火的碰撞：需要一种冰镇饮料和一种热饮。',
    discovered: false,
  },
  {
    id: 'rec_trio',
    name: '三重奏',
    inputs: ['fnt_001', 'tea_002', 'cof_001'],
    output: 'rec_trio',
    hint: '汽水、茶、咖啡各取其一，调和出意想不到的风味。',
    discovered: false,
  },
  {
    id: 'rec_spring_elixir',
    name: '春之甘露',
    inputs: ['lim_sakura', 'lim_matcha_latte', 'tea_001'],
    output: 'rec_spring_elixir',
    hint: '春天的气息凝聚在瓶中…需要两味春日限定与一味清茶。',
    discovered: false,
  },
  {
    id: 'rec_four_seasons',
    name: '四季精华',
    inputs: ['lim_sakura', 'lim_watermelon', 'lim_pumpkin', 'lim_gingerbread'],
    output: 'rec_four_seasons',
    hint: '四季轮转，各取一季限定，汇聚成时光的味道。',
    discovered: false,
  },
];

export function getRecipeById(id) {
  return RECIPES.find(r => r.id === id);
}

export function findRecipeByInputs(inputIds) {
  var sorted = inputIds.slice().sort();
  for (var i = 0; i < RECIPES.length; i++) {
    var recipeSorted = RECIPES[i].inputs.slice().sort();
    if (sorted.length === recipeSorted.length && sorted.every(function(v, idx) { return v === recipeSorted[idx]; })) {
      return RECIPES[i];
    }
  }
  return null;
}
