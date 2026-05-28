export const MACHINES = [
  {
    id: 'vm_soda',
    name: '汽水贩卖机',
    theme: 'soda',
    icon: '🥤',
    unlockType: 'initial',
    unlockCost: 0,
    pullCost: 10,
    pullTenCost: 90,
    poolFilter: b => b.category === 'soda' && !b.limited && !b.synthesizable,
  },
  {
    id: 'vm_tea',
    name: '茶饮贩卖机',
    theme: 'tea',
    icon: '🍵',
    unlockType: 'coin',
    unlockCost: 50,
    pullCost: 10,
    pullTenCost: 90,
    poolFilter: b => b.category === 'tea' && !b.limited && !b.synthesizable,
  },
  {
    id: 'vm_coffee',
    name: '咖啡贩卖机',
    theme: 'coffee',
    icon: '☕',
    unlockType: 'coin',
    unlockCost: 80,
    pullCost: 10,
    pullTenCost: 90,
    poolFilter: b => b.category === 'coffee' && !b.limited && !b.synthesizable,
  },
  {
    id: 'vm_limited',
    name: '限定·珍藏',
    theme: 'limited',
    icon: '💎',
    unlockType: 'coin',
    unlockCost: 200,
    pullCost: 15,
    pullTenCost: 135,
    poolFilter: b => b.limited,
  },
];

export function getMachineById(id) {
  return MACHINES.find(m => m.id === id);
}
