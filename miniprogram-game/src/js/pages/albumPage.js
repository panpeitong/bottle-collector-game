import { registerPage } from '../app.js';
import { bottleService } from '../services/bottleService.js';
import { drawBottleSprite } from '../renderer.js';

export function initAlbumPage() {
  registerPage('album', renderAlbumPage);
}

function renderAlbumPage(container) {
  const album = bottleService.getAlbum();
  const owned = album.filter(b => b.owned).length;
  const total = album.length;

  const categories = {
    '🥤 汽水': album.filter(b => b.category === 'soda'),
    '🍵 茶饮': album.filter(b => b.category === 'tea'),
    '☕ 咖啡': album.filter(b => b.category === 'coffee'),
  };

  let html = `
    <div style="margin-bottom:8px;">
      <span style="font-size:10px;">📖 收集图鉴</span>
      <span style="font-size:9px;float:right;">${owned}/${total} (${Math.round(owned / total * 100)}%)</span>
    </div>
    <div style="background:#333;height:6px;border-radius:3px;margin-bottom:12px;">
      <div style="background:#e94560;height:100%;width:${Math.round(owned / total * 100)}%;border-radius:3px;"></div>
    </div>
  `;

  for (const [catName, bottles] of Object.entries(categories)) {
    if (bottles.length === 0) continue;
    const catOwned = bottles.filter(b => b.owned).length;
    html += `<div style="font-size:9px;margin:8px 0 4px;">${catName} (${catOwned}/${bottles.length})</div>`;
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">';
    bottles.forEach((b) => {
      const id = `album-b-${b.id}`;
      html += `
        <div style="text-align:center;padding:2px;${!b.owned ? 'opacity:0.35;' : ''}">
          <canvas id="${id}" width="64" height="64"></canvas>
          <div style="font-size:5px;margin-top:2px;line-height:1.2;${b.owned ? '' : 'color:#555;'}">
            ${b.owned ? b.name : '???'}
          </div>
        </div>`;
    });
    html += '</div>';
  }

  container.innerHTML = html;

  setTimeout(() => {
    for (const [, bottles] of Object.entries(categories)) {
      bottles.forEach(b => {
        const c = document.getElementById(`album-b-${b.id}`);
        if (c) {
          if (b.owned) {
            drawBottleSprite(c.getContext('2d'), 2, 2, b, 0.9);
          } else {
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, 64, 64);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(2, 2, 60, 60);
            ctx.fillStyle = '#444';
            ctx.font = '14px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('?', 32, 36);
            ctx.textAlign = 'start';
          }
        }
      });
    }
  }, 50);
}
