import { registerPage } from '../app.js';
import { MACHINES } from '../data/machines.js';
import { BOTTLES } from '../data/bottles.js';
import { machineService } from '../services/machineService.js';
import { economyService } from '../services/economyService.js';
import { drawBottleSprite } from '../renderer.js';
import { RARITY } from '../utils/constants.js';

let currentMachineIdx = 0;
let isAnimating = false;
var displayCache = {};

const COLS = 5, ROWS = 7, SLOTS = 35;
const B_SIZE = 46, GAP = 6, LABEL_H = 12;
const SHELF_H = B_SIZE + LABEL_H + GAP;
const GLASS_W = COLS * (B_SIZE + GAP) + GAP;
const CANVAS_H = ROWS * SHELF_H + GAP;

// 金色1 紫色4 蓝色10 绿色10 白色10
const LAYOUT = [
  RARITY.EPIC,     RARITY.PRECIOUS, RARITY.PRECIOUS, RARITY.PRECIOUS, RARITY.EPIC,
  RARITY.PRECIOUS, RARITY.PRECIOUS, RARITY.RARE,     RARITY.PRECIOUS, RARITY.PRECIOUS,
  RARITY.PRECIOUS, RARITY.EPIC,     RARITY.LEGENDARY, RARITY.EPIC,     RARITY.RARE,
  RARITY.RARE,     RARITY.PRECIOUS, RARITY.RARE,     RARITY.RARE,     RARITY.RARE,
  RARITY.COMMON,   RARITY.RARE,     RARITY.COMMON,   RARITY.RARE,     RARITY.COMMON,
  RARITY.COMMON,   RARITY.COMMON,   RARITY.RARE,     RARITY.COMMON,   RARITY.RARE,
  RARITY.COMMON,   RARITY.COMMON,   RARITY.COMMON,   RARITY.COMMON,   RARITY.PRECIOUS,
];

export function initMachinePage() {
  registerPage('machine', renderMachinePage);
}

function renderMachinePage(container) {
  var machines = machineService.getUnlockedMachines();
  if (machines.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;font-size:10px;">暂无贩卖机</div>';
    return;
  }
  if (currentMachineIdx >= machines.length) currentMachineIdx = 0;
  var machine = machines[currentMachineIdx];
  var coins = economyService.getCoins();
  var pool = BOTTLES.filter(machine.poolFilter);
  if (!displayCache[machine.id]) { displayCache[machine.id] = fillSlots(pool); }
  var displayBottles = displayCache[machine.id];

  container.innerHTML = '<div style="text-align:center;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
      '<button id="sign-in-btn" class="pixel-btn" style="font-size:8px;">📅签到</button>' +
      '<span class="coin-display" id="coin-display-top">🪙' + coins + '</span>' +
    '</div>' +
    '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:6px;">' +
      '<button id="prev-machine" class="pixel-btn" style="font-size:14px;padding:4px 8px;"' + (machines.length<=1?' disabled':'') + '>◀</button>' +
      '<span style="font-size:10px;">' + machine.icon + ' ' + machine.name + '</span>' +
      '<button id="next-machine" class="pixel-btn" style="font-size:14px;padding:4px 8px;"' + (machines.length<=1?' disabled':'') + '>▶</button>' +
    '</div>' +
    '<div style="background:linear-gradient(180deg,#D32F2F,#B71C1C 30%,#8B0000 70%,#660000);border:5px solid #555;border-radius:16px;padding:8px;max-width:' + (GLASS_W+40) + 'px;margin:0 auto;box-shadow:0 4px 30px rgba(0,0,0,0.5),inset 0 2px 10px rgba(255,255,255,0.1);">' +
      '<div style="background:#1a1a2e;border:2px solid #ccc;padding:4px;margin-bottom:6px;border-radius:4px;text-align:center;font-size:7px;color:#fff;letter-spacing:3px;text-shadow:0 0 4px #e94560;">🥤 DRINK COLLECTOR</div>' +
      '<div id="machine-glass" style="background:#0a0a15;border:4px solid #777;border-radius:8px;padding:4px;margin-bottom:6px;position:relative;overflow:hidden;box-shadow:inset 0 0 20px rgba(0,0,0,0.9);">' +
        '<canvas id="machine-canvas" width="' + GLASS_W + '" height="' + CANVAS_H + '" style="display:block;width:100%;image-rendering:pixelated;"></canvas>' +
        '<div id="scan-overlay" style="position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;display:none;"></div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 8px;margin-bottom:4px;">' +
        '<span style="font-size:7px;color:#ccc;">💰' + machine.pullCost + '🪙/抽</span>' +
        '<span style="font-size:7px;color:#ccc;">' + pool.length + '种</span>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:4px;">' +
        '<button id="pull-btn" class="pixel-btn" style="flex:1;font-size:9px;padding:12px 8px;background:#e94560;border:3px solid #ff6b6b;border-radius:8px;"' + (isAnimating?' disabled':'') + '>🥤 抽一瓶</button>' +
        '<button id="pull-ten-btn" class="pixel-btn" style="flex:1;font-size:9px;padding:12px 8px;background:#c62828;border:3px solid #e94560;border-radius:8px;"' + (isAnimating?' disabled':'') + '>🥤 十连抽</button>' +
      '</div>' +
      '<div id="collect-tray" style="background:#1a1a2e;border:3px inset #555;border-radius:6px;padding:8px;min-height:28px;text-align:center;font-size:8px;color:#666;"><span style="color:#444;">▼ 取物口</span></div>' +
    '</div>' +
    '<div style="margin-top:10px;">' +
      '<button id="unlock-section-btn" class="pixel-btn" style="font-size:7px;">🔓 解锁贩卖机</button>' +
      '<div id="unlock-section" style="display:none;margin-top:6px;"></div>' +
    '</div>' +
  '</div>';

  drawGlass(displayBottles);
  bindEvts(machine.id, displayBottles, machines.length);
}

function fillSlots(machinePool) {
  if (machinePool.length === 0) return [];
  var byRarity = {};
  machinePool.forEach(function(b) {
    if (!byRarity[b.rarity]) byRarity[b.rarity] = [];
    byRarity[b.rarity].push(b);
  });
  return LAYOUT.map(function(targetRarity) {
    var candidates = byRarity[targetRarity];
    if (!candidates || candidates.length === 0) {
      candidates = BOTTLES.filter(function(b) { return b.rarity === targetRarity; });
    }
    if (!candidates || candidates.length === 0) {
      return machinePool[Math.floor(Math.random() * machinePool.length)];
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
  });
}

function drawGlass(slots) {
  var canvas = document.getElementById('machine-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#0a0a15';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  slots.forEach(function(bottle, i) {
    var col = i % COLS, row = Math.floor(i / COLS);
    var x = GAP + col * (B_SIZE + GAP), y = GAP + row * SHELF_H;
    ctx.fillStyle = '#111';
    ctx.fillRect(x - 2, y - 2, B_SIZE + 4, SHELF_H);
    drawBottleSprite(ctx, x, y, bottle, B_SIZE / 64);
    ctx.fillStyle = '#999';
    ctx.font = '4px "Press Start 2P"';
    var name = bottle.name.length > 3 ? bottle.name.substring(0, 3) + '..' : bottle.name;
    ctx.fillText(name, x, y + B_SIZE + 8);
    ctx.fillStyle = '#FFD700';
    ctx.font = '3px "Press Start 2P"';
    ctx.fillText('⭐'.repeat(Math.min(bottle.rarity, 3)), x, y + B_SIZE + 14);
  });
}

function bindEvts(machineId, displayBottles, machineCount) {
  var pullBtn = document.getElementById('pull-btn');
  var pullTenBtn = document.getElementById('pull-ten-btn');
  if (pullBtn) pullBtn.onclick = function() { doPull(machineId, 1, displayBottles); };
  if (pullTenBtn) pullTenBtn.onclick = function() { doPull(machineId, 10, displayBottles); };

  var prevBtn = document.getElementById('prev-machine');
  var nextBtn = document.getElementById('next-machine');
  if (prevBtn) prevBtn.onclick = function() { currentMachineIdx = Math.max(0, currentMachineIdx - 1); window._codexRender(); };
  if (nextBtn) nextBtn.onclick = function() { currentMachineIdx = Math.min(machineCount - 1, currentMachineIdx + 1); window._codexRender(); };

  var signBtn = document.getElementById('sign-in-btn');
  if (signBtn) signBtn.onclick = function() {
    var r = economyService.dailySignIn();
    updateTray(r.success ? '✅ 签到 +20🪙' : '今日已签到', !r.success);
    refreshCoin();
  };

  var unlockBtn = document.getElementById('unlock-section-btn');
  if (unlockBtn) unlockBtn.onclick = function() {
    var section = document.getElementById('unlock-section');
    if (!section) return;
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
    if (section.style.display === 'block') renderUnlock(section);
  };
}

function refreshCoin() {
  var el = document.getElementById('coin-display-top');
  if (el) el.textContent = '🪙' + economyService.getCoins();
}

function updateTray(msg, isError) {
  var tray = document.getElementById('collect-tray');
  if (tray) tray.innerHTML = '<span style="color:' + (isError ? '#e94560' : '#4CAF50') + ';font-size:8px;">' + msg + '</span>';
}

// ====== PULL + ANIMATION ======

function doPull(machineId, count, displaySlots) {
  if (isAnimating) return;

  var result = machineService.pull(machineId, count);
  if (!result.success) {
    updateTray('❌ ' + result.reason, true);
    refreshCoin();
    return;
  }

  isAnimating = true;
  var overlay = document.getElementById('scan-overlay');
  if (!overlay) { isAnimating = false; return; }
  overlay.innerHTML = '';
  overlay.style.display = 'block';

  // Target rarities from actual pull results
  var targetRarities = [];
  for (var i = 0; i < result.bottles.length; i++) {
    targetRarities.push(result.bottles[i].rarity);
  }

  var numHL = Math.min(count, 10);
  var highlights = [];
  var usedTargets = [];

  for (var i = 0; i < numHL; i++) {
    var finalSlot = findSlotForRarity(targetRarities[i], usedTargets);
    highlights.push({ finalSlot: finalSlot, stopped: false, curSlot: Math.floor(Math.random() * SLOTS) });
  }

  var allStopped = 0;
  var maxFlashes = count === 1 ? 12 : 16;
  var flashIdx = 0;

  function tick() {
    overlay.innerHTML = '';

    if (flashIdx >= maxFlashes) {
      for (var k = 0; k < highlights.length; k++) {
        addHL(overlay, highlights[k].finalSlot, true);
      }
      setTimeout(function() {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
        isAnimating = false;
        showPopup(result);
        var name = result.bottles[0] ? result.bottles[0].name : '';
        if (count === 1) {
          updateTray('🎉 ' + name + (result.againOne ? ' 🎫再来!' : ''), false);
        } else {
          var n1 = result.bottles[0] ? result.bottles[0].name : '';
          var n2 = result.bottles[1] ? result.bottles[1].name : '';
          updateTray('🎉 ' + n1 + ' ' + n2 + ' 等' + result.bottles.length + '瓶' + (result.againOne ? ' 🎫再来!' : ''), false);
        }
        refreshCoin();
      }, 700);
      return;
    }

    for (var j = 0; j < highlights.length; j++) {
      var h = highlights[j];
      if (h.stopped) {
        addHL(overlay, h.finalSlot, true);
      } else if (flashIdx > 6 && Math.random() < 0.3) {
        h.stopped = true;
        allStopped++;
        addHL(overlay, h.finalSlot, true);
      } else {
        if (flashIdx > 4 && Math.random() < 0.35) {
          h.curSlot = h.finalSlot;
        } else {
          h.curSlot = Math.floor(Math.random() * SLOTS);
        }
        addHL(overlay, h.curSlot, false);
      }
    }

    var delay = count === 1 ? 50 + flashIdx * 30 : 60 + flashIdx * 20;
    flashIdx++;
    setTimeout(tick, delay);
  }

  tick();
}

function findSlotForRarity(rarity, usedTargets) {
  if (rarity === undefined || rarity === null) return Math.floor(Math.random() * SLOTS);
  var matching = [];
  for (var s = 0; s < LAYOUT.length; s++) {
    if (LAYOUT[s] === rarity && usedTargets.indexOf(s) === -1) {
      matching.push(s);
    }
  }
  if (matching.length > 0) {
    var slot = matching[Math.floor(Math.random() * matching.length)];
    usedTargets.push(slot);
    return slot;
  }
  return Math.floor(Math.random() * SLOTS);
}

function addHL(overlay, slotIdx, isFinal) {
  var col = slotIdx % COLS, row = Math.floor(slotIdx / COLS);
  var x = GAP + col * (B_SIZE + GAP) - 2;
  var y = GAP + row * SHELF_H - 2;
  var canvas = document.getElementById('machine-canvas');
  if (!canvas) return;
  var rect = canvas.getBoundingClientRect();
  var sx = rect.width / canvas.width, sy = rect.height / canvas.height;

  var el = document.createElement('div');
  el.style.cssText = 'position:absolute;left:' + (x * sx) + 'px;top:' + (y * sy) + 'px;' +
    'width:' + ((B_SIZE + 4) * sx) + 'px;height:' + (SHELF_H * sy) + 'px;' +
    'border:' + (isFinal ? '3px solid #FFD700' : '2px solid #f0c040') + ';border-radius:4px;' +
    'background:' + (isFinal ? 'rgba(255,215,0,0.3)' : 'rgba(240,192,64,0.12)') + ';' +
    (isFinal ? 'box-shadow:0 0 20px #FFD700,0 0 40px #FFA000;' : '') + 'pointer-events:none;';
  overlay.appendChild(el);
}

// ====== POPUP ======

function showPopup(result) {
  var old = document.getElementById('result-popup');
  if (old) old.remove();

  var bottles = result.bottles;
  var again = result.againOne ? '🎫 再来一瓶！' : '';
  var grid = '';
  var max = Math.min(bottles.length, 20);
  for (var i = 0; i < max; i++) {
    grid += '<div style="text-align:center;"><canvas id="rp-b-' + i + '" width="60" height="60"></canvas>' +
      '<div style="font-size:5px;color:#999;margin-top:2px;">' + (bottles[i].name.length > 4 ? bottles[i].name.substring(0,4) : bottles[i].name) + '</div></div>';
  }

  var popup = document.createElement('div');
  popup.id = 'result-popup';
  popup.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.75);z-index:1000;display:flex;align-items:center;justify-content:center;';
  popup.innerHTML = '<div style="background:#16213e;border:3px solid #e94560;border-radius:16px;padding:16px;max-width:340px;width:90%;box-shadow:0 0 40px rgba(233,69,96,0.4);text-align:center;max-height:80vh;overflow-y:auto;">' +
    '<div style="font-size:28px;margin-bottom:4px;">🎉</div>' +
    '<div style="font-size:11px;color:#e94560;margin-bottom:2px;">获得 ' + bottles.length + ' 瓶！</div>' +
    (again ? '<div style="font-size:9px;color:#FFD700;margin-bottom:6px;">' + again + '</div>' : '') +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;justify-items:center;margin:8px 0;">' + grid + '</div>' +
    (bottles.length > 20 ? '<div style="font-size:7px;color:#888;">...还有 ' + (bottles.length - 20) + ' 瓶</div>' : '') +
    '<button id="popup-close-btn" class="pixel-btn" style="font-size:9px;padding:8px 24px;margin-top:8px;">确 定</button></div>';

  popup.addEventListener('click', function(e) { if (e.target === popup) popup.remove(); });
  document.body.appendChild(popup);
  var closeBtn = document.getElementById('popup-close-btn');
  if (closeBtn) closeBtn.onclick = function() { popup.remove(); };

  setTimeout(function() {
    for (var i = 0; i < max; i++) {
      var c = document.getElementById('rp-b-' + i);
      if (c) drawBottleSprite(c.getContext('2d'), 2, 2, bottles[i]);
    }
  }, 100);
}

// ====== UNLOCK ======

function renderUnlock(container) {
  var unlocked = machineService.getUnlockedMachines().map(function(m) { return m.id; });
  var locked = MACHINES.filter(function(m) { return unlocked.indexOf(m.id) === -1; });
  var html = '';
  for (var i = 0; i < locked.length; i++) {
    var m = locked[i];
    html += '<div style="display:flex;align-items:center;gap:8px;padding:6px;border:1px solid #333;margin:4px 0;border-radius:4px;">' +
      '<span style="font-size:16px;">' + m.icon + '</span>' +
      '<span style="flex:1;font-size:9px;">' + m.name + '</span>' +
      '<button class="pixel-btn" data-unlock="' + m.id + '">🔓 ' + m.unlockCost + '🪙</button></div>';
  }
  container.innerHTML = html || '<div style="font-size:9px;color:#888;padding:8px;">暂无可解锁贩卖机</div>';

  var buttons = container.querySelectorAll('[data-unlock]');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].onclick = (function(machineId) {
      return function() {
        var r = machineService.unlockMachine(machineId);
        alert(r.success ? '解锁成功！' : r.reason);
        if (window._codexRender) window._codexRender();
      };
    })(buttons[i].dataset.unlock);
  }
}

// Animation style
if (!document.querySelector('#machine-anim')) {
  var s = document.createElement('style');
  s.id = 'machine-anim';
  s.textContent = '@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}';
  document.head.appendChild(s);
}
