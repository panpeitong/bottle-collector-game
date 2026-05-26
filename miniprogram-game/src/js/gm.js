import { economyService } from './services/economyService.js';
import { bottleService } from './services/bottleService.js';
import { dataAdapter } from './services/dataAdapter.js';
import { render } from './app.js';
import { BOTTLES } from './data/bottles.js';

window.gm = {
  addCoins(n) { economyService.addCoins(n); render(); },
  addBottle(id, count = 1) { for (let i = 0; i < count; i++) bottleService.addBottle(id); render(); },
  addAllBottles() { BOTTLES.forEach(b => { if (!bottleService.getCount(b.id)) bottleService.addBottle(b.id); }); render(); },
  reset() { dataAdapter.reset(); location.reload(); },
  yamadaOn() { window.__yamadaForceAvailable = true; render(); },
  yamadaOff() { window.__yamadaForceAvailable = false; render(); },
  stats() {
    const inv = bottleService.getInventory();
    const album = bottleService.getAlbum();
    console.log(`🪙${economyService.getCoins()} 🧃${inv.length} 📖${album.filter(b=>b.owned).length}/${album.length}`);
  }
};

function createGMPanel() {
  const panel = document.createElement('div');
  panel.id = 'gm-panel';
  panel.innerHTML = `
    <div style="position:fixed;bottom:70px;right:8px;z-index:9999;
      background:#1a1a2e;border:2px solid #f0c040;border-radius:8px;padding:10px;
      font-size:9px;max-width:200px;display:none;" id="gm-inner">
      <div style="color:#f0c040;margin-bottom:6px;">🎮 GM面板</div>
      <button class="gm-btn" data-action="coins2000">🪙 +2000</button>
      <button class="gm-btn" data-action="coins5000">🪙 +5000</button>
      <button class="gm-btn" data-action="allBottles">📖 全图鉴</button>
      <button class="gm-btn" data-action="yamada" id="gm-yamada-btn">🧓 山田营业</button>
      <button class="gm-btn" data-action="reset" style="color:#e94560;">🔄 重置</button>
    </div>
    <button id="gm-toggle" style="position:fixed;bottom:66px;right:8px;z-index:9999;
      background:#f0c040;color:#1a1a2e;border:none;border-radius:50%;width:32px;height:32px;
      font-size:14px;cursor:pointer;font-family:'Press Start 2P',cursive;">🎮</button>
  `;
  document.body.appendChild(panel);

  document.getElementById('gm-toggle').addEventListener('click', () => {
    const inner = document.getElementById('gm-inner');
    inner.style.display = inner.style.display === 'none' ? 'block' : 'none';
  });

  panel.querySelectorAll('.gm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'coins2000') economyService.addCoins(2000);
      if (action === 'coins5000') economyService.addCoins(5000);
      if (action === 'allBottles') {
        BOTTLES.forEach(b => { if (!bottleService.getCount(b.id)) bottleService.addBottle(b.id); });
      }
      if (action === 'yamada') {
        window.__yamadaForceAvailable = !window.__yamadaForceAvailable;
        btn.textContent = window.__yamadaForceAvailable ? '🧓 山田(开)' : '🧓 山田营业';
        btn.style.background = window.__yamadaForceAvailable ? '#4CAF50' : '';
      }
      if (action === 'reset') { dataAdapter.reset(); location.reload(); }
      render();
    });
  });
}

const style = document.createElement('style');
style.textContent = `
  .gm-btn { display:block;width:100%;margin:4px 0;padding:5px 8px;background:#0f3460;color:#eee;border:1px solid #e94560;font-family:'Press Start 2P',cursive;font-size:7px;cursor:pointer;border-radius:4px; }
  .gm-btn:hover { background:#e94560;color:#fff; }
`;
document.head.appendChild(style);

createGMPanel();
console.log('🎮 GM面板: 右下角按钮');
