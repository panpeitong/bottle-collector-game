import { initMachinePage } from './pages/machinePage.js';
import { initBackpackPage } from './pages/backpackPage.js';
import { initSynthPage } from './pages/synthPage.js';
import { initAlbumPage } from './pages/albumPage.js';
import { getPlayer } from './services/dataAdapter.js';
import './gm.js';

const pages = {};
let currentPage = 'machine';
let transitioning = false;

export function registerPage(name, renderFn) {
  pages[name] = renderFn;
}

export function render() {
  const container = document.getElementById('page-container');
  const fn = pages[currentPage];
  if (!fn) return;
  if (transitioning) return;
  transitioning = true;

  // Fade out
  container.style.opacity = '0';
  container.style.transform = 'translateY(4px)';
  container.style.transition = 'opacity 150ms ease, transform 150ms ease';

  setTimeout(function() {
    container.innerHTML = '';
    fn(container);
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
    transitioning = false;
  }, 150);

  // Tab highlight
  document.querySelectorAll('#tab-bar .tab').forEach(function(t) {
    t.classList.toggle('active', t.dataset.page === currentPage);
  });
}

// Global render trigger
window._codexRender = render;

function switchPage(name) {
  if (name === currentPage) return;
  currentPage = name;
  render();
}

// Tab click
document.querySelectorAll('#tab-bar .tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    switchPage(tab.dataset.page);
  });
});

// Keyboard shortcuts (desktop only)
if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch(e.key) {
      case '1': switchPage('machine'); break;
      case '2': switchPage('backpack'); break;
      case '3': switchPage('synth'); break;
      case '4': switchPage('album'); break;
      case ' ':
        e.preventDefault();
        var pullBtn = document.getElementById('pull-btn');
        if (pullBtn && !pullBtn.disabled) pullBtn.click();
        break;
      case 'Enter':
        var closeBtn = document.getElementById('popup-close-btn');
        if (closeBtn) closeBtn.click();
        break;
    }
  });
}

// Touch feedback (vibration)
if (navigator.vibrate) {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.pixel-btn, .filter-tab, .tab, button');
    if (btn && !btn.disabled) {
      try { navigator.vibrate(10); } catch(ignore) {}
    }
  }, true);
}

// Global toast system
window._codexToast = function(msg, duration) {
  duration = duration || 3000;
  var old = document.getElementById('codex-toast');
  if (old) old.remove();
  var toast = document.createElement('div');
  toast.id = 'codex-toast';
  toast.style.cssText = 'position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:9999;' +
    'background:rgba(22,33,62,0.95);color:#FFD700;font-family:"Press Start 2P",cursive;font-size:7px;' +
    'padding:8px 16px;border:2px solid #FFD700;border-radius:8px;text-align:center;max-width:280px;' +
    'box-shadow:0 0 20px rgba(255,215,0,0.4);animation:popIn 0.2s ease-out;pointer-events:none;';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
  }, duration);
};

window._codexGetPlayer = getPlayer;

// Init pages
initMachinePage();
initBackpackPage();
initSynthPage();
initAlbumPage();
getPlayer();
render();
