import { achievementService } from '../services/achievementService.js';
import { ACHIEVEMENTS } from '../utils/constants.js';

export function renderAchievementPage(container) {
  const all = achievementService.getAll();
  const completed = all.filter(function(a) { return a.completed; }).length;
  const categories = {
    collector: { label: '收集者', icon: '📦' },
    synthesizer: { label: '合成师', icon: '⚗️' },
    tycoon: { label: '大亨', icon: '💰' },
    lucky: { label: '幸运儿', icon: '🍀' },
    hunter: { label: '限定猎人', icon: '💎' },
  };

  var html = '<div class="top-bar"><span class="page-title">🏆 成就</span><span style="font-size:9px;">' + completed + '/' + ACHIEVEMENTS.length + '</span></div>' +
    '<button id="ach-back-btn" class="pixel-btn" style="margin-bottom:8px;font-size:7px;">← 返回图鉴</button>';

  for (var catKey in categories) {
    var cat = categories[catKey];
    var catAchs = all.filter(function(a) { return a.category === catKey; });
    if (catAchs.length === 0) continue;
    var catDone = catAchs.filter(function(a) { return a.completed; }).length;
    html += '<div class="section-title">' + cat.icon + ' ' + cat.label + ' (' + catDone + '/' + catAchs.length + ')</div>';

    catAchs.forEach(function(ach) {
      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px;border:1px solid ' + (ach.completed ? '#4CAF50' : '#333') + ';margin:3px 0;border-radius:4px;background:' + (ach.completed ? 'rgba(76,175,80,0.08)' : 'transparent') + ';">' +
        '<span style="font-size:20px;' + (ach.completed ? '' : 'opacity:0.3;') + '">' + ach.icon + '</span>' +
        '<div style="flex:1;">' +
          '<div style="font-size:8px;' + (ach.completed ? 'color:#4CAF50;' : '') + '">' + ach.name + '</div>' +
          '<div style="font-size:6px;color:#888;">' + ach.desc + '</div>' +
          '<div class="progress-bar" style="height:4px;margin-top:3px;"><div class="progress-fill" style="width:' + ach.pct + '%;' + (ach.completed ? 'background:#4CAF50;' : '') + '"></div></div>' +
          '<div style="font-size:5px;color:#888;">' + ach.progress + '/' + ach.target + (ach.reward.coins ? ' → 🪙' + ach.reward.coins : ach.reward.ticket ? ' → 🎫' + ach.reward.ticket : '') + '</div>' +
        '</div>' +
        (ach.completed ? '<span style="color:#4CAF50;">✓</span>' : '') +
      '</div>';
    });
  }

  container.innerHTML = html;

  document.getElementById('ach-back-btn') && document.getElementById('ach-back-btn').addEventListener('click', function() {
    import('./albumPage.js').then(function() {
      if (window._codexRender) window._codexRender();
    });
  });
}
