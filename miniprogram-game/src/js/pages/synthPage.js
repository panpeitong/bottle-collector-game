import { registerPage, render } from '../app.js';
import { synthService } from '../services/synthService.js';
import { bottleService } from '../services/bottleService.js';
import { economyService } from '../services/economyService.js';
import { achievementService } from '../services/achievementService.js';
import { yamadaService } from '../services/yamadaService.js';
import { getPlayer } from '../services/dataAdapter.js';
import { RECIPES } from '../data/recipes.js';
import { drawBottleSprite } from '../renderer.js';
import { BLIND_BOX_THRESHOLD, RARITY_NAMES, SYNTH_COSTS, RARITY } from '../utils/constants.js';

let autoRefreshTimer = null;
let activeTab = 'upgrade'; // 'upgrade' or 'recipe'
let selectedRarity = null;
let selectedMaterials = [];
let selectedRecipeMaterials = [];

export function initSynthPage() { registerPage('synth', renderSynthPage); }

function renderSynthPage(container) {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  const coins = economyService.getCoins();
  const blindAvailable = bottleService.checkBlindBox();
  const inventory = bottleService.getInventory();

  // Upgrade tab content
  var materialsByRarity = {};
  for (var r = 1; r <= 4; r++) materialsByRarity[r] = synthService.getSynthMaterialsByRarity(r);

  var rarityTabsHTML = '';
  for (var r = 1; r <= 4; r++) {
    var mats = materialsByRarity[r];
    var cost = SYNTH_COSTS[r] || 200;
    var active = selectedRarity === r;
    rarityTabsHTML += '<button class="filter-tab' + (active ? ' filter-active' : '') + '" data-rarity="' + r + '" style="font-size:7px;' + (mats.length === 0 ? 'opacity:0.3;' : '') + '">' + RARITY_NAMES[r] + ' (' + mats.length + '/🪙' + cost + ')</button>';
  }

  var materialSelectHTML = '';
  if (selectedRarity && materialsByRarity[selectedRarity]) {
    var mats = materialsByRarity[selectedRarity];
    if (mats.length < 3) {
      materialSelectHTML = '<div style="font-size:8px;color:#e94560;padding:8px;text-align:center;">需要至少3种同稀有度瓶</div>';
    } else {
      materialSelectHTML = '<div style="font-size:7px;color:#888;margin-bottom:4px;">勾选3个材料：</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;">' +
        mats.map(function(item, i) {
          var isSel = selectedMaterials.indexOf(item.bottle.id) >= 0;
          var full = selectedMaterials.length >= 3;
          return '<div class="synth-mat-item' + (isSel ? ' synth-mat-selected' : '') + '" data-mat="' + item.bottle.id + '" style="border:2px solid ' + (isSel ? '#FFD700' : '#333') + ';border-radius:4px;padding:4px;text-align:center;cursor:' + (full && !isSel ? 'not-allowed' : 'pointer') + ';opacity:' + (full && !isSel ? '0.4' : '1') + ';background:' + (isSel ? 'rgba(255,215,0,0.12)' : 'transparent') + ';">' +
            '<canvas id="mat-canvas-' + i + '" width="48" height="48"></canvas>' +
            '<div style="font-size:6px;">' + item.bottle.name.substring(0,4) + '</div><div style="font-size:6px;color:#888;">x' + item.count + '</div></div>';
        }).join('') + '</div>';
    }
  }

  var canSynth = selectedMaterials.length === 3;
  var synthCost = selectedRarity ? (SYNTH_COSTS[selectedRarity] || 200) : 0;

  // Recipe tab content
  var recipeSelectHTML = '<div style="font-size:7px;color:#888;margin-bottom:4px;">选择材料瓶（2-4个）：</div>';
  var recipeMaterials = inventory.filter(function(item) { return item.count >= 1; });
  recipeSelectHTML += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:8px;">' +
    recipeMaterials.map(function(item, i) {
      var isSel = selectedRecipeMaterials.indexOf(item.bottle.id) >= 0;
      return '<div class="synth-mat-item' + (isSel ? ' synth-mat-selected' : '') + '" data-recmat="' + item.bottle.id + '" style="border:2px solid ' + (isSel ? '#4CAF50' : '#333') + ';border-radius:4px;padding:4px;text-align:center;cursor:pointer;background:' + (isSel ? 'rgba(76,175,80,0.12)' : 'transparent') + ';">' +
        '<canvas id="recmat-canvas-' + i + '" width="48" height="48"></canvas>' +
        '<div style="font-size:6px;">' + item.bottle.name.substring(0,4) + '</div><div style="font-size:6px;color:#888;">x' + item.count + '</div></div>';
    }).join('') + '</div>';

  // Discovered recipes list
  var discoveredIds = getPlayer().discoveredRecipes || [];
  var discoveredList = '';
  if (discoveredIds.length > 0) {
    discoveredList = '<div style="font-size:7px;color:#4CAF50;margin-top:4px;">🔮 已发现配方：</div>';
    discoveredIds.forEach(function(rid) {
      var rec = RECIPES.find(function(r) { return r.id === rid; });
      if (rec) discoveredList += '<div style="font-size:6px;color:#888;margin:2px 0;">✅ ' + rec.name + '</div>';
    });
  }

  // Blind box
  var blindHtml = blindAvailable
    ? '<div style="border:2px solid #FFD700;padding:10px;text-align:center;margin-top:10px;background:#1a1a2e;border-radius:4px;"><div style="font-size:10px;">🎁 阶段盲抽</div><div style="font-size:7px;color:#888;">每' + BLIND_BOX_THRESHOLD + '种触发（⭐⭐⭐+）</div><button id="blind-pull-btn" class="blind-box-btn" style="margin-top:6px;">🎁 开启</button></div>'
    : '<div style="text-align:center;color:#666;margin-top:10px;font-size:7px;">盲抽进度：' + (getPlayer().ownedNewCount % BLIND_BOX_THRESHOLD) + '/' + BLIND_BOX_THRESHOLD + '</div>';

  // Yamada
  var yamadaStatus = yamadaService.getSessionStatus();
  var yamadaHtml;
  if (!yamadaStatus.active) {
    yamadaHtml = '<div style="text-align:center;padding:16px;color:#888;font-size:9px;"><div style="font-size:30px;">🧓</div><div>' + yamadaStatus.reason + '</div><div style="font-size:7px;margin-top:4px;color:#666;">🕘早9-12 🕒午15-18 🌙夜21-23</div></div>';
  } else {
    var sellable = yamadaService.getSellableBottles();
    var epMult = yamadaStatus.prices[RARITY.EPIC], legMult = yamadaStatus.prices[RARITY.LEGENDARY];
    var epTrend = yamadaService.getTrend(RARITY.EPIC), legTrend = yamadaService.getTrend(RARITY.LEGENDARY);
    var trendIcon = { up: '📈', down: '📉', stable: '➡️' };
    var secLeft = 60 - new Date().getSeconds();
    var sellableHtml = sellable.length === 0 ? '<div style="font-size:8px;color:#888;padding:8px;">无紫/金瓶可售</div>' :
      sellable.map(function(item, i) {
        var mult = yamadaStatus.prices[item.bottle.rarity];
        var basePrice = item.bottle.rarity === RARITY.EPIC ? 80 : 300;
        var finalPrice = Math.floor(basePrice * mult);
        return '<div style="display:flex;align-items:center;gap:8px;padding:6px;border:1px solid #333;margin:4px 0;border-radius:4px;">' +
          '<canvas id="yamada-b-' + i + '" width="48" height="48"></canvas>' +
          '<div style="flex:1;font-size:8px;"><div>' + item.bottle.name + ' ×' + item.count + '</div><div style="color:' + (mult > 1.5 ? '#4CAF50' : mult < 0.7 ? '#e94560' : '#ccc') + ';font-size:7px;">×' + mult.toFixed(1) + ' = ' + finalPrice + '🪙</div></div>' +
          '<button class="pixel-btn" data-yamada-sell="' + item.bottle.id + '" style="font-size:7px;">卖' + finalPrice + '🪙</button></div>';
      }).join('');
    yamadaHtml = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="font-size:30px;">🧓</span><div><div style="font-size:9px;">山田 ' + yamadaStatus.session + '</div><div style="font-size:6px;color:#888;">波动: ' + secLeft + '秒</div></div></div>' +
      '<div style="display:flex;gap:12px;margin-bottom:8px;font-size:7px;"><div style="color:#9C27B0;">🟣 ×' + epMult.toFixed(1) + ' ' + trendIcon[epTrend] + '</div><div style="color:#FF9800;">🟡 ×' + legMult.toFixed(1) + ' ' + trendIcon[legTrend] + '</div></div>' +
      '<div id="yamada-sell-list">' + sellableHtml + '</div>';
  }

  // Render
  container.innerHTML = '<div class="top-bar"><span class="page-title">⚗️ 合成台</span><span class="coin-display">🪙 ' + coins + '</span></div>' +
    '<div style="display:flex;gap:4px;margin-bottom:8px;">' +
      '<button class="filter-tab' + (activeTab === 'upgrade' ? ' filter-active' : '') + '" data-tab="upgrade" style="flex:1;font-size:7px;">⚗️ 三合一</button>' +
      '<button class="filter-tab' + (activeTab === 'recipe' ? ' filter-active' : '') + '" data-tab="recipe" style="flex:1;font-size:7px;">🔮 配方合成</button>' +
    '</div>' +
    '<div id="synth-tab-content">' +
    (activeTab === 'upgrade' ?
      '<div class="synth-section"><h3>三合一升级</h3><div style="font-size:7px;color:#888;margin-bottom:6px;">3个同稀有度不同瓶 → 随机高一级</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:8px;">' + rarityTabsHTML + '</div>' +
        '<div id="synth-mat-area" style="margin-bottom:8px;">' + materialSelectHTML + '</div>' +
        '<button id="synth-exec-btn" class="pixel-btn synth-btn" style="width:100%;font-size:9px;padding:10px;"' + (canSynth ? '' : ' disabled') + '>' + (canSynth ? '⚗️ 合成 (🪙' + synthCost + ')' : '选择3个材料') + '</button>' +
        blindHtml + '<div id="synth-result" style="margin-top:8px;text-align:center;"></div>' +
      '</div>' :
      '<div class="synth-section"><h3>配方合成</h3><div style="font-size:7px;color:#888;margin-bottom:6px;">特定组合 → 唯一珍藏品（线索在图鉴中）</div>' +
        recipeSelectHTML +
        '<button id="recipe-exec-btn" class="pixel-btn synth-btn" style="width:100%;font-size:9px;padding:10px;background:#4CAF50;border-color:#66BB6A;"' + (selectedRecipeMaterials.length >= 2 ? '' : ' disabled') + '>' + (selectedRecipeMaterials.length >= 2 ? '🔮 尝试合成' : '选择2-4个材料') + '</button>' +
        discoveredList + '<div id="recipe-result" style="margin-top:8px;text-align:center;"></div>' +
      '</div>'
    ) +
    '</div>' +
    '<div class="synth-section" style="border-color:#795548;"><h3>🧓 山田收购站 <span style="font-size:6px;color:#888;">- 每分钟波动·仅收紫/金</span></h3>' + yamadaHtml + '<div id="yamada-result" style="margin-top:8px;text-align:center;"></div></div>';

  // Draw canvases
  setTimeout(function() {
    if (activeTab === 'upgrade' && selectedRarity) {
      (materialsByRarity[selectedRarity] || []).forEach(function(item, i) { var c = document.getElementById('mat-canvas-' + i); if (c) drawBottleSprite(c.getContext('2d'), 2, 2, item.bottle, 0.68); });
    }
    if (activeTab === 'recipe') {
      recipeMaterials.forEach(function(item, i) { var c = document.getElementById('recmat-canvas-' + i); if (c) drawBottleSprite(c.getContext('2d'), 2, 2, item.bottle, 0.68); });
    }
    if (yamadaStatus.active) {
      yamadaService.getSellableBottles().forEach(function(item, i) { var c = document.getElementById('yamada-b-' + i); if (c) drawBottleSprite(c.getContext('2d'), 2, 2, item.bottle, 0.68); });
    }
  }, 50);

  // Tab switching
  container.querySelectorAll('[data-tab]').forEach(function(btn) {
    btn.addEventListener('click', function() { activeTab = btn.dataset.tab; selectedMaterials = []; selectedRecipeMaterials = []; selectedRarity = null; render(); });
  });

  // Upgrade rarity tabs
  container.querySelectorAll('[data-rarity]').forEach(function(btn) {
    btn.addEventListener('click', function() { selectedRarity = parseInt(btn.dataset.rarity); selectedMaterials = []; render(); });
  });

  // Material selection
  container.querySelectorAll('[data-mat]').forEach(function(el) {
    el.addEventListener('click', function() {
      var id = el.dataset.mat;
      var idx = selectedMaterials.indexOf(id);
      if (idx >= 0) selectedMaterials.splice(idx, 1);
      else if (selectedMaterials.length < 3) selectedMaterials.push(id);
      render();
    });
  });

  // Recipe material selection
  container.querySelectorAll('[data-recmat]').forEach(function(el) {
    el.addEventListener('click', function() {
      var id = el.dataset.recmat;
      var idx = selectedRecipeMaterials.indexOf(id);
      if (idx >= 0) selectedRecipeMaterials.splice(idx, 1);
      else if (selectedRecipeMaterials.length < 4) selectedRecipeMaterials.push(id);
      render();
    });
  });

  // Execute upgrade
  var execBtn = document.getElementById('synth-exec-btn');
  if (execBtn && canSynth) execBtn.addEventListener('click', function() {
    var result = synthService.synthUpgrade(selectedMaterials.slice());
    if (result.success) {
      selectedMaterials = [];
      showResult('synth-result', result, '');
      var newAchs = achievementService.check();
      if (newAchs.length > 0) window._codexToast && window._codexToast('🏆 成就解锁！');
    } else alert(result.reason);
    render();
  });

  // Execute recipe
  var recipeBtn = document.getElementById('recipe-exec-btn');
  if (recipeBtn) recipeBtn.addEventListener('click', function() {
    var result = synthService.synthRecipe(selectedRecipeMaterials.slice());
    if (result.success) {
      selectedRecipeMaterials = [];
      showResult('recipe-result', result, '🔮');
      achievementService.check();
    } else alert(result.reason);
    render();
  });

  // Blind box
  document.getElementById('blind-pull-btn') && document.getElementById('blind-pull-btn').addEventListener('click', function() {
    var result = synthService.blindBoxPull();
    showResult('synth-result', result, '🎁');
  });

  // Yamada sell
  container.querySelectorAll('[data-yamada-sell]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var result = yamadaService.sellToYamada(btn.dataset.yamadaSell);
      var el = document.getElementById('yamada-result');
      if (result.success) el.innerHTML = '<div style="font-size:9px;color:#4CAF50;">✅ +' + result.price + '🪙 (×' + result.multiplier.toFixed(1) + ')</div>';
      else el.innerHTML = '<div style="font-size:9px;color:#e94560;">' + result.reason + '</div>';
      achievementService.check();
      render();
    });
  });

  autoRefreshTimer = setInterval(function() { render(); }, 15000);
}

function showResult(elId, result, prefix) {
  prefix = prefix || '';
  var el = document.getElementById(elId);
  if (!el || !result.success) return;
  el.innerHTML = '<canvas id="' + elId + '-canvas" width="68" height="68"></canvas><div style="font-size:9px;margin-top:4px;color:#4CAF50;">' + prefix + '「' + result.newBottle.name + '」!</div>';
  setTimeout(function() { var c = document.getElementById(elId + '-canvas'); if (c) drawBottleSprite(c.getContext('2d'), 2, 2, result.newBottle); }, 50);
}
