import { initMachinePage } from './pages/machinePage.js';
import { initBackpackPage } from './pages/backpackPage.js';
import { initSynthPage } from './pages/synthPage.js';
import { initAlbumPage } from './pages/albumPage.js';
import { getPlayer } from './services/dataAdapter.js';
import './gm.js';

const pages = {};
let currentPage = 'machine';

export function registerPage(name, renderFn) {
  pages[name] = renderFn;
}

export function render() {
  const container = document.getElementById('page-container');
  const fn = pages[currentPage];
  if (fn) {
    container.innerHTML = '';
    fn(container);
  }
  document.querySelectorAll('#tab-bar .tab').forEach(t => {
    t.classList.toggle('active', t.dataset.page === currentPage);
  });
}

// Expose render globally so pages can trigger re-render without circular imports
window._codexRender = render;

function switchPage(name) {
  currentPage = name;
  render();
}

document.querySelectorAll('#tab-bar .tab').forEach(tab => {
  tab.addEventListener('click', () => switchPage(tab.dataset.page));
});

initMachinePage();
initBackpackPage();
initSynthPage();
initAlbumPage();
getPlayer();
render();
