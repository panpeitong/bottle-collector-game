import { registerPage, render } from '../app.js';
import { synthService } from '../services/synthService.js';
import { bottleService } from '../services/bottleService.js';
import { economyService } from '../services/economyService.js';
import { yamadaService } from '../services/yamadaService.js';
import { getPlayer } from '../services/dataAdapter.js';
import { drawBottleSprite } from '../renderer.js';
import { BLIND_BOX_THRESHOLD, RARITY_NAMES, SYNTH_COSTS, RARITY } from '../utils/constants.js';

let autoRefreshTimer = null;

export function initSynthPage() {
  registerPage('synth', renderSynthPage);
}

function renderSynthPage(container) {
  // Clear old timer
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);

  const inventory = bottleService.getInventory();
  const coins = economyService.getCoins();
  const blindAvailable = bottleService.checkBlindBox();

  // === SYNTH SECTION ===
  const synthable = inventory.filter(item =>
    !item.bottle.limited && item.count >= 3 && item.bottle.rarity < 5
  );

  const synthHtml = synthable.length === 0
    ? '<div style="color:#888;text-align:center;padding:16px;font-size:9px;">暂无可合成的瓶子（需3个同款，非限定/非传说）</div>'
    : synthable.map((item, i) => {
        const cost = SYNTH_COSTS[item.bottle.rarity] || 200;
        return `
          <div style="display:flex;align-items:center;gap:6px;padding:8px;border:1px solid #333;margin:4px 0;border-radius:4px;">
            <canvas id="synth-src-${i}" width="48" height="48"></canvas>
            <span style="font-size:8px;color:#888;">x3</span>
            <span style="font-size:10px;">→</span>
            <span style="font-size:8px;">?</span>
            <div style="flex:1;font-size:9px;">
              <div>${item.bottle.name}</div>
              <div style="color:#888;font-size:7px;">→ ${RARITY_NAMES[item.bottle.rarity + 1]}</div>
            </div>
            <button class="pixel-btn synth-btn" data-id="${item.bottle.id}">⚗️${cost}🪙</button>
          </div>`;
      }).join('');

  const blindHtml = blindAvailable
    ? `<div style="border:2px solid #FFD700;padding:10px;text-align:center;margin-top:10px;background:#1a1a2e;border-radius:4px;">
        <div style="font-size:10px;">🎁 阶段盲抽已就绪！</div>
        <div style="font-size:7px;color:#888;margin-top:4px;">每收集${BLIND_BOX_THRESHOLD}种触发（保底⭐⭐⭐+）</div>
        <button id="blind-pull-btn" class="pixel-btn" style="margin-top:8px;background:#FFD700;color:#1a1a2e;border-color:#FFD700;">🎁 开启盲盒</button>
      </div>`
    : `<div style="text-align:center;color:#666;margin-top:10px;font-size:7px;">
        下次盲抽进度：${(getPlayer().ownedNewCount % BLIND_BOX_THRESHOLD)}/${BLIND_BOX_THRESHOLD}
      </div>`;

  // === YAMADA SECTION ===
  const yamadaStatus = yamadaService.getSessionStatus();
  let yamadaHtml;

  if (!yamadaStatus.active) {
    yamadaHtml = `
      <div style="text-align:center;padding:16px;color:#888;font-size:9px;">
        <div style="font-size:30px;margin-bottom:8px;">🧓</div>
        <div>${yamadaStatus.reason}</div>
        <div style="font-size:7px;margin-top:4px;color:#666;">🕘 早市 9:00-12:00 | 🕒 午市 15:00-18:00</div>
      </div>`;
  } else {
    const sellable = yamadaService.getSellableBottles();
    const epMult = yamadaStatus.prices[RARITY.EPIC];
    const legMult = yamadaStatus.prices[RARITY.LEGENDARY];
    const epPrice = Math.floor(50 * epMult);
    const legPrice = Math.floor(200 * legMult);
    const epTrend = yamadaService.getTrend(RARITY.EPIC);
    const legTrend = yamadaService.getTrend(RARITY.LEGENDARY);
    const trendIcon = { up: '📈', down: '📉', stable: '➡️' };

    const now = new Date();
    const secLeft = 60 - now.getSeconds();

    const sellableHtml = sellable.length === 0
      ? '<div style="font-size:8px;color:#888;padding:8px;">暂无可出售的紫色/金色罐头</div>'
      : sellable.map((item, i) => {
          const mult = yamadaStatus.prices[item.bottle.rarity];
          const basePrice = item.bottle.rarity === RARITY.EPIC ? 50 : 200;
          const finalPrice = Math.floor(basePrice * mult);
          const isGood = mult > 1.5;
          const isBad = mult < 0.7;
          return `
            <div style="display:flex;align-items:center;gap:8px;padding:6px;border:1px solid #333;margin:4px 0;border-radius:4px;
              background:${isGood?'#1a3a1a':isBad?'#3a1a1a':'transparent'}">
              <canvas id="yamada-b-${i}" width="48" height="48"></canvas>
              <div style="flex:1;font-size:8px;">
                <div>${item.bottle.name} ×${item.count}</div>
                <div style="color:${isGood?'#4CAF50':isBad?'#e94560':'#ccc'};font-size:7px;">
                  ×${mult.toFixed(1)} = ${finalPrice}🪙
                </div>
              </div>
              <button class="pixel-btn" data-yamada-sell="${item.bottle.id}" style="font-size:7px;background:${isGood?'#4CAF50':'#0f3460'};border-color:${isGood?'#4CAF50':'#e94560'};">
                卖🪙${finalPrice}
              </button>
            </div>`;
        }).join('');

    yamadaHtml = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:30px;">🧓</span>
        <div>
          <div style="font-size:9px;">山田先生 <span style="color:#888;font-size:7px;">${yamadaStatus.session}</span></div>
          <div style="font-size:6px;color:#888;">下次波动: ${secLeft}秒后</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-bottom:8px;font-size:7px;">
        <div style="color:#9C27B0;">
          🟣 紫色 ×${epMult.toFixed(1)} (${epPrice}🪙) ${trendIcon[epTrend]}
        </div>
        <div style="color:#FF9800;">
          🟡 金色 ×${legMult.toFixed(1)} (${legPrice}🪙) ${trendIcon[legTrend]}
        </div>
      </div>
      <div id="yamada-sell-list">${sellableHtml}</div>`;
  }

  // === RENDER ===
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <span style="font-size:10px;">⚗️ 合成台</span>
      <span class="coin-display">🪙 ${coins}</span>
    </div>

    <div style="border:2px solid #9C27B0;border-radius:8px;padding:10px;margin-bottom:12px;background:#0a0a1a;">
      <div style="font-size:9px;margin-bottom:6px;">⚗️ 三合一合成</div>
      <div style="font-size:7px;color:#888;margin-bottom:6px;">3个同款非限定瓶 → 随机高一级</div>
      ${synthHtml}
      ${blindHtml}
    </div>
    <div id="synth-result" style="margin-top:8px;text-align:center;"></div>

    <div style="border:2px solid #795548;border-radius:8px;padding:10px;margin-top:12px;background:#0a0a1a;">
      <div style="font-size:9px;margin-bottom:8px;">🧓 山田收购站 <span style="font-size:6px;color:#888;">- 每分钟波动·仅收紫/金</span></div>
      ${yamadaHtml}
      <div id="yamada-result" style="margin-top:8px;text-align:center;"></div>
    </div>
  `;

  // Draw bottles
  setTimeout(() => {
    synthable.forEach((item, i) => {
      const c = document.getElementById(`synth-src-${i}`);
      if (c) drawBottleSprite(c.getContext('2d'), 2, 2, item.bottle, 0.68);
    });
    if (yamadaStatus.active) {
      const sellable = yamadaService.getSellableBottles();
      sellable.forEach((item, i) => {
        const c = document.getElementById(`yamada-b-${i}`);
        if (c) drawBottleSprite(c.getContext('2d'), 2, 2, item.bottle, 0.68);
      });
    }
  }, 50);

  // Events
  container.querySelectorAll('.synth-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const result = synthService.synthUpgrade(btn.dataset.id);
      showResult('synth-result', result);
    });
  });

  document.getElementById('blind-pull-btn')?.addEventListener('click', () => {
    const result = synthService.blindBoxPull();
    showResult('synth-result', result, '🎁');
  });

  container.querySelectorAll('[data-yamada-sell]').forEach(btn => {
    btn.addEventListener('click', () => {
      const result = yamadaService.sellToYamada(btn.dataset.yamadaSell);
      const el = document.getElementById('yamada-result');
      if (result.success) {
        el.innerHTML = `<div style="font-size:9px;color:#4CAF50;">✅ 卖出「${result.bottle.name}」+${result.price}🪙 (×${result.multiplier.toFixed(1)})</div>`;
      } else {
        el.innerHTML = `<div style="font-size:9px;color:#e94560;">${result.reason}</div>`;
      }
      render();
    });
  });

  // Auto-refresh for Yamada prices (every 15 seconds to catch minute changes)
  autoRefreshTimer = setInterval(() => render(), 15000);
}

function showResult(elId, result, prefix = '') {
  const el = document.getElementById(elId);
  if (!el) return;
  if (result.success) {
    el.innerHTML = `<canvas id="${elId}-canvas" width="68" height="68"></canvas>
      <div style="font-size:9px;margin-top:4px;">${prefix}「${result.newBottle.name}」!</div>`;
    setTimeout(() => {
      const c = document.getElementById(`${elId}-canvas`);
      if (c) drawBottleSprite(c.getContext('2d'), 2, 2, result.newBottle);
    }, 50);
  } else {
    alert(result.reason);
  }
  render();
}
