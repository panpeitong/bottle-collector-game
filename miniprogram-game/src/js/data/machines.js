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
    poolFilter: b => b.category === 'soda' && !b.limited,
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
    poolFilter: b => b.category === 'tea' && !b.limited,
  },
];

export function getMachineById(id) {
  return MACHINES.find(m => m.id === id);
}
