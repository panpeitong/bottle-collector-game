import { economyService } from './services/economyService.js';
import { bottleService } from './services/bottleService.js';
import { machineService } from './services/machineService.js';
import { dataAdapter, getPlayer, savePlayer } from './services/dataAdapter.js';
import { render } from './app.js';
import { BOTTLES } from './data/bottles.js';
import { ACHIEVEMENTS } from './utils/constants.js';

window.gm = {
  addCoins(n) { economyService.addCoins(n); render(); },
  addBottle(id, count) { count = count || 1; for (let i = 0; i < count; i++) bottleService.addBottle(id); render(); },
  addAllBottles() { BOTTLES.forEach(b => { if (!bottleService.getCount(b.id)) bottleService.addBottle(b.id); }); render(); },
  reset() { dataAdapter.reset(); location.reload(); },
  yamadaOn() { window.__yamadaForceAvailable = true; render(); },
  yamadaOff() { window.__yamadaForceAvailable = false; render(); },
  skipCooldown() { const p = getPlayer(); p.lastLimitedPull = 0; p.coolingPullRemaining = 3; savePlayer(); render(); },
  addTicket(tier) { const p = getPlayer(); if (!p.pityTickets) p.pityTickets = { rare: 0, precious: 0, epic: 0 }; p.pityTickets[tier] = (p.pityTickets[tier] || 0) + 1; savePlayer(); render(); },
  setLucky(n) { const p = getPlayer(); p.luckyPoints = n; savePlayer(); render(); },
  unlockAllMachines() { const p = getPlayer(); p.machines = ['vm_soda', 'vm_tea', 'vm_coffee', 'vm_limited']; savePlayer(); render(); },
  unlockAllAchievements() { const p = getPlayer(); p.achievements = {}; ACHIEVEMENTS.forEach(function(a) { p.achievements[a.id] = true; }); savePlayer(); render(); },
  discoverAllRecipes() { const p = getPlayer(); p.discoveredRecipes = ['rec_family_bucket','rec_tea_ceremony','rec_coffee_blend','rec_crossover','rec_ice_fire','rec_trio','rec_spring_elixir','rec_four_seasons']; savePlayer(); render(); },
  stats() {
    const p = getPlayer();
    console.log('🪙' + economyService.getCoins() + ' 🧃' + Object.keys(p.bottles).length + '/' + BOTTLES.length +
      ' 🍀' + (p.luckyPoints||0) + ' 🎫R' + (p.pityTickets?p.pityTickets.rare||0:0) + ' P' + (p.pityTickets?p.pityTickets.precious||0:0) + ' E' + (p.pityTickets?p.pityTickets.epic||0:0) +
      ' 🏆' + Object.keys(p.achievements||{}).length);
  }
};

window._codexAchievements = ACHIEVEMENTS;
window._codexGetPlayer = getPlayer;

function createGMPanel() {
  const panel = document.createElement('div');
  panel.id = 'gm-panel';
  panel.innerHTML = '<div id="gm-inner" style="position:fixed;bottom:70px;right:8px;z-index:9999;background:#1a1a2e;border:2px solid #f0c040;border-radius:8px;padding:10px;font-size:7px;max-width:200px;display:none;max-height:60vh;overflow-y:auto;">' +
    '<div style="color:#f0c040;margin-bottom:6px;">🎮 GM</div>' +
    '<button class="gm-btn" data-action="coins2000">🪙 +2000</button>' +
    '<button class="gm-btn" data-action="coins5000">🪙 +5000</button>' +
    '<button class="gm-btn" data-action="allBottles">📖 全图鉴</button>' +
    '<button class="gm-btn" data-action="unlockAll">🔓 全贩卖机</button>' +
    '<button class="gm-btn" data-action="cooling">⏭ 跳过冷却</button>' +
    '<button class="gm-btn" data-action="yamada" id="gm-yamada-btn">🧓 山田营业</button>' +
    '<button class="gm-btn" data-action="ticketRare">🎫 稀有券+1</button>' +
    '<button class="gm-btn" data-action="ticketPrecious">🎫 珍贵券+1</button>' +
    '<button class="gm-btn" data-action="ticketEpic">🎫 史诗券+1</button>' +
    '<button class="gm-btn" data-action="lucky100">🍀 幸运满</button>' +
    '<button class="gm-btn" data-action="unlockAch">🏆 全成就</button>' +
    '<button class="gm-btn" data-action="discoverRecipes">🔮 全配方</button>' +
    '<button class="gm-btn" data-action="reset" style="color:#e94560;">🔄 重置</button></div>' +
    '<button id="gm-toggle" style="position:fixed;bottom:66px;right:8px;z-index:9999;background:#f0c040;color:#1a1a2e;border:none;border-radius:50%;width:32px;height:32px;font-size:14px;cursor:pointer;font-family:\'Press Start 2P\',cursive;">🎮</button>';
  document.body.appendChild(panel);

  document.getElementById('gm-toggle').addEventListener('click', function() {
    var inner = document.getElementById('gm-inner');
    inner.style.display = inner.style.display === 'none' ? 'block' : 'none';
  });

  panel.querySelectorAll('.gm-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var action = btn.dataset.action;
      if (action === 'coins2000') economyService.addCoins(2000);
      if (action === 'coins5000') economyService.addCoins(5000);
      if (action === 'allBottles') BOTTLES.forEach(function(b) { if (!bottleService.getCount(b.id)) bottleService.addBottle(b.id); });
      if (action === 'unlockAll') { var p = getPlayer(); p.machines = ['vm_soda','vm_tea','vm_coffee','vm_limited']; savePlayer(); }
      if (action === 'cooling') { var p = getPlayer(); p.lastLimitedPull = 0; p.coolingPullRemaining = 3; savePlayer(); }
      if (action === 'yamada') { window.__yamadaForceAvailable = !window.__yamadaForceAvailable; btn.textContent = window.__yamadaForceAvailable ? '🧓 山田(开)' : '🧓 山田营业'; btn.style.background = window.__yamadaForceAvailable ? '#4CAF50' : ''; }
      if (action === 'ticketRare') { var p = getPlayer(); if (!p.pityTickets) p.pityTickets = { rare:0,precious:0,epic:0 }; p.pityTickets.rare++; savePlayer(); }
      if (action === 'ticketPrecious') { var p = getPlayer(); if (!p.pityTickets) p.pityTickets = { rare:0,precious:0,epic:0 }; p.pityTickets.precious++; savePlayer(); }
      if (action === 'ticketEpic') { var p = getPlayer(); if (!p.pityTickets) p.pityTickets = { rare:0,precious:0,epic:0 }; p.pityTickets.epic++; savePlayer(); }
      if (action === 'lucky100') { var p = getPlayer(); p.luckyPoints = 100; savePlayer(); }
      if (action === 'unlockAch') { var p = getPlayer(); p.achievements = {}; ACHIEVEMENTS.forEach(function(a) { p.achievements[a.id] = true; }); savePlayer(); }
      if (action === 'discoverRecipes') { var p = getPlayer(); p.discoveredRecipes = ['rec_family_bucket','rec_tea_ceremony','rec_coffee_blend','rec_crossover','rec_ice_fire','rec_trio','rec_spring_elixir','rec_four_seasons']; savePlayer(); }
      if (action === 'reset') { dataAdapter.reset(); location.reload(); }
      render();
    });
  });
}

var style = document.createElement('style');
style.textContent = '.gm-btn{display:block;width:100%;margin:4px 0;padding:5px 8px;background:#0f3460;color:#eee;border:1px solid #e94560;font-family:"Press Start 2P",cursive;font-size:7px;cursor:pointer;border-radius:4px;}.gm-btn:hover{background:#e94560;color:#fff;}';
document.head.appendChild(style);
createGMPanel();
console.log('🎮 GM: 右下角 | V0.3');
