import { registerPage, render } from '../app.js';
import { bottleService } from '../services/bottleService.js';
import { economyService } from '../services/economyService.js';
import { drawBottleSprite } from '../renderer.js';
import { RARITY_NAMES } from '../utils/constants.js';

const CATEGORIES = [
  { key: 'all', label: '全部', icon: '📦' },
  { key: 'soda', label: '汽水', icon: '🥤' },
  { key: 'tea', label: '茶饮', icon: '🍵' },
  { key: 'coffee', label: '咖啡', icon: '☕' },
];

const RARITY_FILTERS = [
  { key: 'all', label: '全部', star: '🌟' },
  { key: '1', label: '⭐', star: '⭐' },
  { key: '2', label: '⭐⭐', star: '⭐⭐' },
  { key: '3', label: '⭐⭐⭐', star: '⭐⭐⭐' },
  { key: '4', label: '⭐⭐⭐⭐', star: '⭐⭐⭐⭐' },
  { key: '5', label: '⭐⭐⭐⭐⭐', star: '⭐⭐⭐⭐⭐' },
];

let activeFilter = 'all';
let activeRarity = 'all';

export function initBackpackPage() {
  registerPage('backpack', renderBackpackPage);
}

function renderBackpackPage(container) {
  const inventory = bottleService.getInventory();
  const coins = economyService.getCoins();

  // 分类筛选
  let filtered = inventory;
  if (activeFilter !== 'all') {
    filtered = filtered.filter(item => item.bottle.category === activeFilter);
  }
  // 星级筛选
  if (activeRarity !== 'all') {
    filtered = filtered.filter(item => item.bottle.rarity === parseInt(activeRarity));
  }

  // 分类标签
  const catTabs = CATEGORIES.map(cat => {
    let count = inventory.filter(item => {
      if (cat.key === 'all') return true;
      return item.bottle.category === cat.key;
    }).length;
    return `<button class="filter-tab ${activeFilter === cat.key ? 'filter-active' : ''}" data-filter="${cat.key}">
      ${cat.icon} ${cat.label}<span style="font-size:6px;opacity:0.5;">${count}</span>
    </button>`;
  }).join('');

  // 星级标签
  const rarityTabs = RARITY_FILTERS.map(rf => {
    let count = inventory.filter(item => {
      if (rf.key === 'all') return true;
      return item.bottle.rarity === parseInt(rf.key);
    }).length;
    return `<button class="filter-tab rarity-tab ${activeRarity === rf.key ? 'filter-active' : ''}" data-rarity="${rf.key}"
      style="font-size:6px;padding:3px 6px;">${rf.star}<span style="font-size:5px;opacity:0.5;">${count}</span></button>`;
  }).join('');

  // 瓶子列表
  const bottlesHtml = filtered.length === 0
    ? `<div style="text-align:center;color:#888;padding:40px;font-size:9px;">没有匹配的瓶子</div>`
    : filtered.map((item, i) => {
        const isLocked = economyService.isLocked(item.bottle.id);
        return `
        <div class="backpack-item rarity-${item.bottle.rarity}">
          <canvas id="bp-bottle-${i}" width="56" height="56"></canvas>
          <div style="flex:1;font-size:9px;min-width:0;">
            <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.bottle.name}</div>
            <div style="color:#888;font-size:7px;margin-top:2px;">
              ${RARITY_NAMES[item.bottle.rarity]}
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:12px;">x${item.count}</div>
            <div style="display:flex;gap:2px;justify-content:flex-end;margin-top:2px;">
              <button class="pixel-btn lock-btn" data-id="${item.bottle.id}" style="font-size:8px;padding:2px 4px;min-width:24px;">
                ${isLocked ? '🔒' : '🔓'}
              </button>
              <button class="pixel-btn sell-btn" data-id="${item.bottle.id}">🪙${economyService.getSellPrice(item.bottle.id)}</button>
            </div>
          </div>
        </div>`;
      }).join('');

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
      <span style="font-size:10px;">🎒 我的瓶子 (${inventory.length}种)</span>
      <span class="coin-display">🪙 ${coins}</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px;">${catTabs}</div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:8px;padding-top:4px;border-top:1px solid #333;">${rarityTabs}</div>
    <div id="backpack-list">${bottlesHtml}</div>
    <div id="sell-confirm-modal" style="display:none;"></div>
  `;

  setTimeout(() => {
    filtered.forEach((item, i) => {
      const c = document.getElementById(`bp-bottle-${i}`);
      if (c) drawBottleSprite(c.getContext('2d'), 2, 2, item.bottle, 0.8);
    });
  }, 50);

  container.querySelectorAll('.filter-tab[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => { activeFilter = btn.dataset.filter; render(); });
  });
  container.querySelectorAll('.filter-tab[data-rarity]').forEach(btn => {
    btn.addEventListener('click', () => { activeRarity = btn.dataset.rarity; render(); });
  });
  container.querySelectorAll('.lock-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); economyService.toggleLock(btn.dataset.id); render(); });
  });
  container.querySelectorAll('.sell-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bottleId = btn.dataset.id;
      const item = inventory.find(x => x.bottle.id === bottleId);
      if (!item) return;
      if (item.bottle.rarity >= 4) { showSellConfirmModal(bottleId, item); return; }
      doSell(bottleId, item, false);
    });
  });
}

function doSell(bottleId, item, force) {
  var opts = force ? { force: true } : {};
  const price = economyService.getSellPrice(bottleId);
  if (!force && !confirm(`卖出 1 个「${item.bottle.name}」获得 ${price} 🪙？`)) return;
  const result = economyService.sellBottle(bottleId, 1, opts);
  if (!result.success) {
    if (result.locked) alert('该瓶子已锁定，请先解锁');
    else if (result.needConfirm) showSellConfirmModal(bottleId, item);
    else alert(result.reason || '卖出失败');
    return;
  }
  render();
}

function showSellConfirmModal(bottleId, item) {
  const modal = document.getElementById('sell-confirm-modal');
  if (!modal) return;
  const price = economyService.getSellPrice(bottleId);
  const isLocked = economyService.isLocked(bottleId);
  modal.style.display = 'block';
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:999;
      display:flex;align-items:center;justify-content:center;" onclick="event.target===this&&(this.parentElement.style.display='none')">
      <div style="background:#16213e;border:3px solid #FF9800;border-radius:12px;padding:20px;text-align:center;max-width:280px;box-shadow:0 0 30px rgba(255,152,0,0.5);">
        <div style="font-size:40px;">⚠️</div>
        <div style="font-size:12px;color:#FF9800;margin-bottom:8px;">稀有瓶卖出确认</div>
        <canvas id="confirm-bottle-canvas" width="64" height="64"></canvas>
        <div style="font-size:9px;margin:8px 0;">「<span style="color:#FF9800;">${item.bottle.name}</span>」</div>
        <div style="font-size:8px;color:#f0c040;margin-bottom:12px;">🪙 ${price}</div>
        ${isLocked ? '<div style="font-size:8px;color:#e94560;margin-bottom:8px;">🔒 已锁定</div>' : ''}
        <div style="display:flex;gap:8px;justify-content:center;">
          <button class="pixel-btn" onclick="document.getElementById('sell-confirm-modal').style.display='none'">取消</button>
          <button class="pixel-btn" id="confirm-sell-btn" style="background:#e94560;border-color:#e94560;" ${isLocked?'disabled':''}>确认卖出</button>
        </div>
      </div>
    </div>`;
  setTimeout(() => {
    const c = document.getElementById('confirm-bottle-canvas');
    if (c) drawBottleSprite(c.getContext('2d'), 2, 2, item.bottle);
  }, 50);
  document.getElementById('confirm-sell-btn')?.addEventListener('click', () => {
    economyService.sellBottle(bottleId, 1, { force: true });
    modal.style.display = 'none';
    render();
  });
}
