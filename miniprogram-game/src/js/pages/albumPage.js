import { registerPage } from '../app.js';
import { bottleService } from '../services/bottleService.js';
import { drawBottleSprite } from '../renderer.js';
import { COLLECTION_MILESTONES } from '../utils/constants.js';
import { RECIPES } from '../data/recipes.js';
import { BOTTLES } from '../data/bottles.js';
import { getPlayer } from '../services/dataAdapter.js';

export function initAlbumPage() { registerPage('album', renderAlbumPage); }

function renderAlbumPage(container) {
  const album = bottleService.getAlbum();
  const owned = album.filter(function(b) { return b.owned; }).length;
  const total = album.length;
  const discoveredRecipes = getPlayer().discoveredRecipes || [];

  const categories = {
    '🥤 汽水': album.filter(function(b) { return b.category === 'soda' && !b.limited && !b.synthesizable; }),
    '🍵 茶饮': album.filter(function(b) { return b.category === 'tea' && !b.limited && !b.synthesizable; }),
    '☕ 咖啡': album.filter(function(b) { return b.category === 'coffee' && !b.limited && !b.synthesizable; }),
    '💎 限定': album.filter(function(b) { return b.limited; }),
    '🔮 配方': album.filter(function(b) { return b.synthesizable; }),
  };

  const nextMs = bottleService.getNextMilestone();
  const msHTML = nextMs
    ? '<div style="font-size:7px;color:#888;margin-top:4px;">下一个：' + nextMs.count + '种 → ' + (nextMs.reward.coins ? ('+' + nextMs.reward.coins + '🪙') : nextMs.reward.label) + '</div>'
    : '<div style="font-size:7px;color:#FFD700;margin-top:4px;">🏆 全部完成！</div>';

  let html =
    '<div class="top-bar"><span class="page-title">📖 图鉴</span><span style="font-size:9px;">' + owned + '/' + total + ' (' + Math.round(owned / total * 100) + '%)</span></div>' +
    '<div class="progress-bar" style="margin-bottom:4px;"><div class="progress-fill" style="width:' + Math.round(owned / total * 100) + '%;"></div></div>' +
    msHTML +
    '<div style="display:flex;gap:4px;flex-wrap:wrap;margin:6px 0;font-size:6px;color:#666;">' +
    COLLECTION_MILESTONES.map(function(ms) {
      return '<span style="padding:2px 4px;border-radius:3px;' + (owned >= ms.count ? 'background:rgba(76,175,80,0.2);color:#4CAF50;' : 'background:#222;') + '">' + ms.count + '种' + (owned >= ms.count ? ' ✓' : '') + '</span>';
    }).join('') +
    '</div>' +
    '<a id="achievement-link" href="#" style="display:block;text-align:center;font-size:8px;color:#FFD700;padding:6px;border:1px dashed #FFD700;border-radius:4px;margin-bottom:10px;text-decoration:none;">🏆 查看成就</a>';

  // Category sections
  for (const [catName, bottles] of Object.entries(categories)) {
    if (bottles.length === 0) continue;
    const catOwned = bottles.filter(function(b) { return b.owned; }).length;
    const isLimitedCat = catName === '💎 限定';
    const isRecipeCat = catName === '🔮 配方';

    html += '<div class="section-title"><span style="color:' + (isLimitedCat ? '#FFD700' : isRecipeCat ? '#4CAF50' : '#eee') + ';">' + catName + ' (' + catOwned + '/' + bottles.length + ')</span></div>';
    html += '<div class="album-grid">';
    bottles.forEach(function(b) {
      const id = 'album-b-' + b.id;
      // Recipe hint for undiscovered recipe bottles
      var recipeHint = '';
      if (isRecipeCat && !b.owned) {
        var recipe = RECIPES.find(function(r) { return r.output === b.id; });
        if (recipe) recipeHint = ' title="' + recipe.hint + '"';
      }
      html +=
        '<div class="album-item' + (b.owned ? ' owned' : ' locked') + '"' + recipeHint + '>' +
          '<canvas id="' + id + '" width="64" height="64"></canvas>' +
          '<div style="font-size:5px;margin-top:2px;color:' + (b.owned ? (b.limited ? '#FFD700' : isRecipeCat ? '#4CAF50' : '#ccc') : '#555') + ';">' + (b.owned ? b.name : '???') + '</div>' +
        '</div>';
    });
    html += '</div>';
  }

  container.innerHTML = html;

  // Draw all
  setTimeout(function() {
    for (const [, bottles] of Object.entries(categories)) {
      bottles.forEach(function(b) {
        const c = document.getElementById('album-b-' + b.id);
        if (c) {
          if (b.owned) {
            drawBottleSprite(c.getContext('2d'), 2, 2, b, 0.9);
          } else {
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, 64, 64);
            ctx.strokeStyle = b.limited ? '#FFD700' : b.synthesizable ? '#4CAF50' : '#333';
            ctx.lineWidth = 2; ctx.strokeRect(2, 2, 60, 60);
            ctx.fillStyle = '#444'; ctx.font = '14px "Press Start 2P"'; ctx.textAlign = 'center';
            ctx.fillText('?', 32, 36); ctx.textAlign = 'start';
          }
        }
      });
    }
  }, 50);

  // Achievement link
  var achLink = document.getElementById('achievement-link');
  if (achLink) achLink.addEventListener('click', function(e) {
    e.preventDefault();
    // Import and render achievement page inline
    import('./achievementPage.js').then(function(mod) {
      mod.renderAchievementPage(container);
    });
  });
}
