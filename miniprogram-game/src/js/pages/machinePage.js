import { registerPage, render } from '../app.js';
import { MACHINES } from '../data/machines.js';
import { BOTTLES } from '../data/bottles.js';
import { machineService } from '../services/machineService.js';
import { economyService } from '../services/economyService.js';
import { achievementService } from '../services/achievementService.js';
import { drawBottleSprite } from '../renderer.js';
import { RARITY, RARITY_NAMES, LUCKY_POINTS_MAX } from '../utils/constants.js';

let currentMachineIdx = 0;
let isAnimating = false;
var displayCache = {};
var cooldownInterval = null;

const COLS = 5, ROWS = 7, SLOTS = 35;
const B_SIZE = 46, GAP = 6, LABEL_H = 12;
const SHELF_H = B_SIZE + LABEL_H + GAP;
const GLASS_W = COLS * (B_SIZE + GAP) + GAP;
const CANVAS_H = ROWS * SHELF_H + GAP;

const LAYOUT = [
  RARITY.EPIC,     RARITY.PRECIOUS, RARITY.PRECIOUS, RARITY.PRECIOUS, RARITY.EPIC,
  RARITY.PRECIOUS, RARITY.PRECIOUS, RARITY.RARE,     RARITY.PRECIOUS, RARITY.PRECIOUS,
  RARITY.PRECIOUS, RARITY.EPIC,     RARITY.LEGENDARY, RARITY.EPIC,     RARITY.RARE,
  RARITY.RARE,     RARITY.PRECIOUS, RARITY.RARE,     RARITY.RARE,     RARITY.RARE,
  RARITY.COMMON,   RARITY.RARE,     RARITY.COMMON,   RARITY.RARE,     RARITY.COMMON,
  RARITY.COMMON,   RARITY.COMMON,   RARITY.RARE,     RARITY.COMMON,   RARITY.RARE,
  RARITY.COMMON,   RARITY.COMMON,   RARITY.COMMON,   RARITY.COMMON,   RARITY.PRECIOUS,
];

export function initMachinePage() { registerPage('machine', renderMachinePage); }

function formatTime(ms) {
  if (ms <= 0) return '00:00:00';
  var h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

function renderMachinePage(container) {
  if (cooldownInterval) clearInterval(cooldownInterval);
  var machines = machineService.getUnlockedMachines();
  if (machines.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;font-size:10px;">暂无贩卖机</div>';
    return;
  }
  if (currentMachineIdx >= machines.length) currentMachineIdx = 0;
  var machine = machines[currentMachineIdx];
  var coins = economyService.getCoins();
  var pool = BOTTLES.filter(machine.poolFilter);
  if (!displayCache[machine.id]) displayCache[machine.id] = fillSlots(pool);
  var displayBottles = displayCache[machine.id];
  var isLimited = machine.id === 'vm_limited';
  var cooldownInfo = { canPull: true, cooling: false, remaining: 0, pullsLeft: 0 };
  if (isLimited) cooldownInfo = machineService.getLimitedCooldown();
  var luckyPct = Math.round(machineService.getLuckyProgress() / LUCKY_POINTS_MAX * 100);
  var alreadySigned = new Date().toDateString() === (window._codexGetPlayer ? window._codexGetPlayer().lastSignDate : '');
  var pullBtnDisabled = isAnimating || (isLimited && !cooldownInfo.canPull);
  var cooldownHTML = '';
  if (isLimited && cooldownInfo.cooling) cooldownHTML = '<div id="limited-cooldown" style="font-size:8px;color:#FFD700;text-align:center;margin-bottom:4px;">⏳ 冷却中 ' + formatTime(cooldownInfo.remaining) + '</div>';
  else if (isLimited && cooldownInfo.canPull) cooldownHTML = '<div style="font-size:8px;color:#4CAF50;text-align:center;margin-bottom:4px;">💎 可抽取 ' + cooldownInfo.pullsLeft + ' 次</div>';

  container.innerHTML =
    '<div class="top-bar"><span class="page-title">' + machine.icon + ' ' + machine.name + '</span><span class="coin-display">🪙 ' + coins + '</span></div>' +
    '<div class="lucky-bar"><span>🍀</span><div class="lucky-track"><div class="lucky-fill" style="width:' + luckyPct + '%;"></div></div><span>' + luckyPct + '%</span></div>' +
    '<div style="display:flex;gap:8px;margin-bottom:6px;">' +
      '<button id="sign-in-btn" class="pixel-btn" style="flex:1;font-size:8px;"' + (alreadySigned ? ' disabled' : '') + '>📅 ' + (alreadySigned ? '已签到' : '签到 +100🪙') + '</button>' +
      '<button id="prev-machine" class="pixel-btn" style="font-size:12px;padding:4px 6px;">◀</button>' +
      '<button id="next-machine" class="pixel-btn" style="font-size:12px;padding:4px 6px;">▶</button>' +
    '</div>' +
    '<div class="machine-frame">' +
      '<div class="machine-header-bar" style="background:linear-gradient(180deg,' + (isLimited ? '#4A148C,#311B92' : '#D32F2F,#8B0000') + ');">' + (isLimited ? '💎 LIMITED' : '🥤 DRINK COLLECTOR') + '</div>' +
      '<div class="machine-body" style="background:linear-gradient(180deg,' + (isLimited ? '#6A1B9A,#1A0033' : '#B71C1C,#660000') + ');">' +
        '<div class="glass-window" style="border-color:' + (isLimited ? '#FFD700' : '#777') + ';"><div id="machine-glass" style="position:relative;overflow:hidden;">' +
          '<canvas id="machine-canvas" width="' + GLASS_W + '" height="' + CANVAS_H + '" style="display:block;width:100%;image-rendering:pixelated;"></canvas>' +
          '<div id="scan-overlay" style="position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;display:none;"></div>' +
        '</div></div>' +
        '<div style="display:flex;justify-content:space-between;padding:2px 8px;margin-bottom:4px;font-size:7px;color:#ccc;"><span>💰' + machine.pullCost + '🪙/抽</span><span>' + pool.length + '种</span></div>' +
        cooldownHTML +
        '<div style="display:flex;gap:8px;margin-bottom:4px;">' +
          '<button id="pull-btn" class="pixel-btn pull-btn" style="flex:1;"' + (pullBtnDisabled ? ' disabled' : '') + '>🥤 抽一瓶</button>' +
          '<button id="pull-ten-btn" class="pixel-btn pull-btn" style="flex:1;background:#c62828;"' + (isAnimating || isLimited ? ' disabled' : '') + '>🥤 十连抽</button>' +
        '</div>' +
        '<div class="collect-tray" id="collect-tray"><span style="color:#444;">▼ 取物口</span></div>' +
      '</div>' +
    '</div>' +
    '<button id="toggle-unlock-btn" class="pixel-btn" style="width:100%;font-size:7px;margin-top:6px;">🔽 解锁新贩卖机</button>' +
    '<div id="unlock-section" style="display:none;margin-top:4px;"></div>';

  // Draw display
  setTimeout(function() {
    var canvas = document.getElementById('machine-canvas');
    if (canvas) {
      var ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, GLASS_W, CANVAS_H);
      ctx.fillStyle = '#060610'; ctx.fillRect(0, 0, GLASS_W, CANVAS_H);
      for (var s = 0; s < displayBottles.length && s < SLOTS; s++) {
        var col = s % COLS, row = Math.floor(s / COLS);
        drawBottleSprite(ctx, GAP + col * (B_SIZE + GAP), GAP + row * SHELF_H, displayBottles[s], 0.72);
      }
    }
  }, 50);

  // Cooldown ticker
  if (isLimited && cooldownInfo.cooling) {
    var cdEnd = Date.now() + cooldownInfo.remaining;
    cooldownInterval = setInterval(function() {
      var left = cdEnd - Date.now();
      var el = document.getElementById('limited-cooldown');
      if (el) {
        if (left <= 0) { el.innerHTML = '<span style="color:#4CAF50;">✅ 冷却完成！</span>'; clearInterval(cooldownInterval); render(); }
        else el.innerHTML = '⏳ 冷却中 ' + formatTime(left);
      }
    }, 1000);
  }

  // Events
  document.getElementById('sign-in-btn') && document.getElementById('sign-in-btn').addEventListener('click', function() {
    var result = economyService.dailySignIn();
    if (result.success) {
      var msg = '签到成功 +' + result.coins + ' 🪙';
      if (result.extras && result.extras.length) msg += ' (' + result.extras.join(', ') + ')';
      window._codexToast && window._codexToast(msg);
    }
    render();
  });
  document.getElementById('prev-machine') && document.getElementById('prev-machine').addEventListener('click', function() {
    currentMachineIdx = (currentMachineIdx - 1 + machines.length) % machines.length; render();
  });
  document.getElementById('next-machine') && document.getElementById('next-machine').addEventListener('click', function() {
    currentMachineIdx = (currentMachineIdx + 1) % machines.length; render();
  });
  document.getElementById('pull-btn') && document.getElementById('pull-btn').addEventListener('click', function() {
    if (isAnimating) return;
    doPull(machine.id, 1);
  });
  document.getElementById('pull-ten-btn') && document.getElementById('pull-ten-btn').addEventListener('click', function() {
    if (isAnimating || isLimited) return;
    doPull(machine.id, 10);
  });
  document.getElementById('toggle-unlock-btn') && document.getElementById('toggle-unlock-btn').addEventListener('click', function() {
    var sec = document.getElementById('unlock-section');
    if (sec) { sec.style.display = sec.style.display === 'none' ? 'block' : 'none'; if (sec.style.display === 'block') renderUnlock(sec); }
  });
}

function fillSlots(pool) {
  var bottles = [];
  for (var i = 0; i < SLOTS; i++) { if (pool.length > 0) bottles.push(pool[Math.floor(Math.random() * pool.length)]); }
  return bottles;
}

function doPull(machineId, times) {
  var result = machineService.pull(machineId, times);
  if (!result.success) {
    if (result.cooldown) alert('限定机冷却中'); else alert(result.reason);
    return;
  }
  isAnimating = true;
  // Check achievements
  var newAchs = achievementService.check();
  if (newAchs.length > 0) {
    var achNames = newAchs.map(function(id) {
      var ach = (window._codexAchievements || []).find(function(a) { return a.id === id; });
      return ach ? ach.name : '';
    }).filter(Boolean);
    if (achNames.length) window._codexToast && window._codexToast('🏆 ' + achNames.join(', '));
  }
  doScanAnimation(result);
}

function doScanAnimation(result) {
  var overlay = document.getElementById('scan-overlay');
  if (!overlay) { finishPull(result); return; }
  overlay.style.display = 'block'; overlay.innerHTML = '';
  var finalBottles = result.bottles;
  var usedTargets = []; var stepsDone = 0;
  var totalSteps = Math.min(finalBottles.length * 2 + 8, 30);
  var interval = Math.max(30, 400 / totalSteps);
  var timer = setInterval(function() {
    stepsDone++; overlay.innerHTML = '';
    if (stepsDone >= totalSteps) { clearInterval(timer); overlay.style.display = 'none'; finishPull(result); return; }
    for (var h = 0; h < 3; h++) addHL(overlay, getSlotForRarity(null, usedTargets), false);
    if (stepsDone >= totalSteps - 3) {
      for (var f = 0; f < finalBottles.length && f < 3; f++) addHL(overlay, getSlotForRarity(finalBottles[f] ? finalBottles[f].rarity : null, []), true);
    }
  }, interval);
}

function getSlotForRarity(rarity, usedTargets) {
  if (rarity === undefined || rarity === null) return Math.floor(Math.random() * SLOTS);
  var matching = [];
  for (var s = 0; s < LAYOUT.length; s++) { if (LAYOUT[s] === rarity && usedTargets.indexOf(s) === -1) matching.push(s); }
  if (matching.length > 0) { var slot = matching[Math.floor(Math.random() * matching.length)]; usedTargets.push(slot); return slot; }
  return Math.floor(Math.random() * SLOTS);
}

function addHL(overlay, slotIdx, isFinal) {
  var col = slotIdx % COLS, row = Math.floor(slotIdx / COLS);
  var x = GAP + col * (B_SIZE + GAP) - 2, y = GAP + row * SHELF_H - 2;
  var canvas = document.getElementById('machine-canvas'); if (!canvas) return;
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

function finishPull(result) {
  isAnimating = false;
  if (result.milestone) {
    var ms = result.milestone;
    setTimeout(function() {
      var rewardText = ms.reward.coins ? ('+' + ms.reward.coins + ' 🪙') : (ms.reward.label || '保底券');
      window._codexToast && window._codexToast('🎉 里程碑！' + ms.count + '种：' + rewardText);
    }, 400);
  }
  showPopup(result);
  render();
}

function showPopup(result) {
  var old = document.getElementById('result-popup'); if (old) old.remove();
  var bottles = result.bottles;
  var again = result.againOne ? '🎫 再来一瓶！' : '';
  var grid = '';
  var max = Math.min(bottles.length, 20);
  for (var i = 0; i < max; i++) {
    grid += '<div style="text-align:center;"><canvas id="rp-b-' + i + '" width="60" height="60"></canvas><div style="font-size:5px;color:#999;margin-top:2px;">' + (bottles[i].name.length > 4 ? bottles[i].name.substring(0,4) : bottles[i].name) + '</div></div>';
  }
  var popup = document.createElement('div');
  popup.id = 'result-popup';
  popup.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.75);z-index:1000;display:flex;align-items:center;justify-content:center;';
  popup.innerHTML = '<div style="background:#16213e;border:3px solid #e94560;border-radius:16px;padding:16px;max-width:340px;width:90%;box-shadow:0 0 40px rgba(233,69,96,0.4);text-align:center;max-height:80vh;overflow-y:auto;">' +
    '<div style="font-size:28px;margin-bottom:4px;">🎉</div><div style="font-size:11px;color:#e94560;margin-bottom:2px;">获得 ' + bottles.length + ' 瓶！</div>' +
    (again ? '<div style="font-size:9px;color:#FFD700;margin-bottom:6px;">' + again + '</div>' : '') +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;justify-items:center;margin:8px 0;">' + grid + '</div>' +
    (bottles.length > 20 ? '<div style="font-size:7px;color:#888;">...还有 ' + (bottles.length - 20) + ' 瓶</div>' : '') +
    '<button id="popup-close-btn" class="pixel-btn" style="font-size:9px;padding:8px 24px;margin-top:8px;">确 定</button></div>';
  popup.addEventListener('click', function(e) { if (e.target === popup) popup.remove(); });
  document.body.appendChild(popup);
  document.getElementById('popup-close-btn') && (document.getElementById('popup-close-btn').onclick = function() { popup.remove(); });
  setTimeout(function() { for (var i = 0; i < max; i++) { var c = document.getElementById('rp-b-' + i); if (c) drawBottleSprite(c.getContext('2d'), 2, 2, bottles[i]); } }, 100);
}

function renderUnlock(container) {
  var unlocked = machineService.getUnlockedMachines().map(function(m) { return m.id; });
  var locked = MACHINES.filter(function(m) { return unlocked.indexOf(m.id) === -1; });
  var html = '';
  for (var i = 0; i < locked.length; i++) {
    var m = locked[i];
    html += '<div style="display:flex;align-items:center;gap:8px;padding:6px;border:1px solid #333;margin:4px 0;border-radius:4px;">' +
      '<span style="font-size:16px;">' + m.icon + '</span><span style="flex:1;font-size:9px;">' + m.name + '</span>' +
      '<button class="pixel-btn" data-unlock="' + m.id + '">🔓 ' + m.unlockCost + '🪙</button></div>';
  }
  container.innerHTML = html || '<div style="font-size:9px;color:#888;padding:8px;">暂无可解锁贩卖机</div>';
  container.querySelectorAll('[data-unlock]').forEach(function(btn) {
    btn.onclick = function() {
      var r = machineService.unlockMachine(btn.dataset.unlock);
      alert(r.success ? '解锁成功！' : r.reason);
      window._codexRender && window._codexRender();
    };
  });
}

if (!document.querySelector('#machine-anim')) {
  var s = document.createElement('style'); s.id = 'machine-anim';
  s.textContent = '@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}';
  document.head.appendChild(s);
}
