const LOCALES = [
  { group: "🌐 Global",   code: "global", name: "Global" },
  { group: "🌍 English",  code: "en",    name: "United States" },
  { group: "🌍 English",  code: "en-au", name: "Australia" },
  { group: "🌍 English",  code: "en-ca", name: "Canada" },
  { group: "🌍 English",  code: "en-gb", name: "United Kingdom" },
  { group: "🌍 English",  code: "en-hk", name: "Hong Kong" },
  { group: "🌍 English",  code: "en-ie", name: "Ireland" },
  { group: "🌍 English",  code: "en-nz", name: "New Zealand" },
  { group: "🌍 English",  code: "en-sg", name: "Singapore" },
  { group: "🌍 English",  code: "en-tt", name: "Trinidad & Tobago" },
  { group: "🇩🇪 German",  code: "de-de", name: "Germany" },
  { group: "🇩🇪 German",  code: "de-at", name: "Austria" },
  { group: "🇩🇪 German",  code: "de-ch", name: "Switzerland" },
  { group: "🇫🇷 French",  code: "fr-fr", name: "France" },
  { group: "🇫🇷 French",  code: "fr-ca", name: "Canada" },
  { group: "🇫🇷 French",  code: "fr-be", name: "Belgium" },
  { group: "🇫🇷 French",  code: "fr-ch", name: "Switzerland" },
  { group: "🇪🇸 Spanish", code: "es-es", name: "Spain" },
  { group: "🇪🇸 Spanish", code: "es-mx", name: "Mexico" },
  { group: "🌐 Other",    code: "it-it", name: "Italy" },
  { group: "🌐 Other",    code: "nl-nl", name: "Netherlands" },
  { group: "🌐 Other",    code: "nl-be", name: "Belgium – Flemish" },
  { group: "🌐 Other",    code: "pt-br", name: "Brazil" },
  { group: "🌍 Nordics",  code: "nb-no", name: "Norway" },
  { group: "🌍 Nordics",  code: "sv-se", name: "Sweden" },
  { group: "🌍 Nordics",  code: "fi-fi", name: "Finland" },
  { group: "🌍 Nordics",  code: "da-dk", name: "Denmark" },
  { group: "🌏 APAC",     code: "ja-jp", name: "Japan" },
  { group: "🌏 APAC",     code: "ko-kr", name: "South Korea" },
  { group: "🌏 APAC",     code: "zh-tw", name: "Taiwan" },
  { group: "🌏 APAC",     code: "th-th", name: "Thailand" },
  { group: "🌏 APAC",     code: "tr-tr", name: "Turkey" },
];

const LOCALE_CODES = LOCALES.map(l => l.code);
const ALL_SEGMENTS = ['global', ...LOCALE_CODES.filter(c => c !== 'global')];
const LOCALE_RE = new RegExp(`(stressless\\.com\\/)(${ALL_SEGMENTS.join('|')})(?:\\/|(?=[?#]|$))`);
const LOCALE_MAP = Object.fromEntries(LOCALES.map(l => [l.code, l]));

function detectLocale(url) {
  if (!url) return null;
  const m = url.match(LOCALE_RE);
  return m ? m[2] : null;
}

// When opened as a standalone fallback window, background.js passes the
// original tab's URL and ID as query params so we target the right tab.
const _p = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const _paramTabUrl = _p.get('tabUrl')   || '';
const _paramTabId  = _p.get('tabId')    ? Number(_p.get('tabId'))    : null;
const _paramWinId  = _p.get('windowId') ? Number(_p.get('windowId')) : null;

function resolveActiveTab(cb) {
  if (_paramTabUrl) { cb({ url: _paramTabUrl, id: _paramTabId }); return; }
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => cb(tabs[0] || {}));
}

function switchUrl(url, newCode) {
  if (LOCALE_RE.test(url)) {
    return url.replace(LOCALE_RE, (_, prefix) => prefix + newCode + '/');
  }
  return url.replace(/(stressless\.com\/)/, `$1${newCode}/`);
}

function isStressless(url) {
  return /stressless\.com/.test(url);
}

// ── Storage helpers ──
function loadFavourites(cb) {
  chrome.storage.local.get('favourites', data => cb(data.favourites || []));
}
function saveFavourites(favs, cb) {
  chrome.storage.local.set({ favourites: favs }, cb);
}

// ── Navigate to locale ──
function navigateTo(code) {
  resolveActiveTab(tab => {
    const url = tab.url || '';
    if (isStressless(url)) {
      if (tab.id != null) chrome.tabs.update(tab.id, { url: switchUrl(url, code) });
      // In standalone mode the original window is in the background — bring it forward.
      if (_paramWinId != null) chrome.windows.update(_paramWinId, { focused: true, state: 'normal' });
    } else {
      chrome.tabs.create({ url: `https://www.stressless.com/${code}/` });
    }
    window.close();
  });
}

// ── Render switch tab ──
function renderSwitchTab(activeCode, favs, filter) {
  const container = document.getElementById('locale-list');
  const noResults = document.getElementById('no-results');
  container.innerHTML = '';

  const q = (filter || '').toLowerCase().trim();
  let visibleCount = 0;

  // --- FAVOURITES SECTION ---
  if (!q && favs.length > 0) {
    const label = document.createElement('div');
    label.className = 'group-label';
    label.textContent = '★ Favourites';
    container.appendChild(label);

    favs.forEach((code, idx) => {
      const locale = LOCALE_MAP[code];
      if (!locale) return;
      const item = makeLocaleItem(locale, activeCode, favs, idx + 1);
      container.appendChild(item);
      visibleCount++;
    });
  }

  // --- ALL LOCALES BY GROUP ---
  const groups = {};
  for (const l of LOCALES) {
    if (q && !l.code.toLowerCase().includes(q) && !l.name.toLowerCase().includes(q) && !l.group.toLowerCase().includes(q)) continue;
    if (!groups[l.group]) groups[l.group] = [];
    groups[l.group].push(l);
  }

  for (const [groupName, items] of Object.entries(groups)) {
    const label = document.createElement('div');
    label.className = 'group-label';
    label.textContent = groupName;
    container.appendChild(label);

    for (const locale of items) {
      const favIdx = favs.indexOf(locale.code);
      const shortcut = (!q && favIdx !== -1) ? null : null; // badges only in fav section
      const item = makeLocaleItem(locale, activeCode, favs, null);
      container.appendChild(item);
      visibleCount++;
    }
  }

  noResults.style.display = visibleCount === 0 ? 'block' : 'none';
}

function makeLocaleItem(locale, activeCode, favs, shortcutNum) {
  const isFav = favs.includes(locale.code);
  const isActive = locale.code === activeCode;

  const item = document.createElement('div');
  item.className = 'locale-item' + (isActive ? ' active' : '');
  item.dataset.code = locale.code;

  // shortcut badge (only in favourites section, 1-indexed)
  const badge = document.createElement('span');
  badge.className = 'shortcut-badge';
  badge.textContent = shortcutNum !== null ? shortcutNum : '';
  badge.style.visibility = shortcutNum !== null ? 'visible' : 'hidden';

  const code = document.createElement('span');
  code.className = 'locale-code';
  code.textContent = locale.code;

  const name = document.createElement('span');
  name.className = 'locale-name';
  name.textContent = locale.name;

  const favBtn = document.createElement('button');
  favBtn.className = 'fav-btn' + (isFav ? ' is-fav' : '');
  favBtn.title = isFav ? 'Remove from favourites' : 'Add to favourites';
  favBtn.textContent = '★';

  favBtn.addEventListener('click', e => {
    e.stopPropagation();
    loadFavourites(currentFavs => {
      let newFavs;
      if (currentFavs.includes(locale.code)) {
        newFavs = currentFavs.filter(c => c !== locale.code);
      } else {
        newFavs = [...currentFavs, locale.code];
      }
      saveFavourites(newFavs, () => {
        renderSwitchTab(activeCode, newFavs, document.getElementById('search').value);
      });
    });
  });

  item.appendChild(badge);
  item.appendChild(code);
  item.appendChild(name);
  item.appendChild(favBtn);

  item.addEventListener('click', () => navigateTo(locale.code));

  return item;
}

// ── Render manage tab ──
function renderManageTab(favs) {
  const container = document.getElementById('fav-list');
  container.innerHTML = '';

  if (favs.length === 0) {
    container.innerHTML = '<div class="empty-favs"><span class="em">★</span>No favourites yet.<br>Star locales in the Switch tab.</div>';
    return;
  }

  let dragSrc = null;

  favs.forEach((code, idx) => {
    const locale = LOCALE_MAP[code];
    if (!locale) return;

    const item = document.createElement('div');
    item.className = 'fav-manage-item';
    item.draggable = true;
    item.dataset.code = code;

    item.innerHTML = `
      <span class="fav-num">${idx + 1}</span>
      <span class="fav-code">${locale.code}</span>
      <span class="fav-name">${locale.name}</span>
      <span class="fav-handle">⠿</span>
      <button class="remove-btn" title="Remove">×</button>
    `;

    item.querySelector('.remove-btn').addEventListener('click', e => {
      e.stopPropagation();
      loadFavourites(currentFavs => {
        const newFavs = currentFavs.filter(c => c !== code);
        saveFavourites(newFavs, () => renderManageTab(newFavs));
      });
    });

    // Drag events
    item.addEventListener('dragstart', e => {
      dragSrc = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      document.querySelectorAll('.fav-manage-item').forEach(i => i.classList.remove('drag-over'));
    });
    item.addEventListener('dragover', e => {
      e.preventDefault();
      document.querySelectorAll('.fav-manage-item').forEach(i => i.classList.remove('drag-over'));
      if (item !== dragSrc) item.classList.add('drag-over');
    });
    item.addEventListener('drop', e => {
      e.preventDefault();
      if (!dragSrc || dragSrc === item) return;

      loadFavourites(currentFavs => {
        const srcCode = dragSrc.dataset.code;
        const tgtCode = item.dataset.code;
        const srcIdx = currentFavs.indexOf(srcCode);
        const tgtIdx = currentFavs.indexOf(tgtCode);
        const newFavs = [...currentFavs];
        newFavs.splice(srcIdx, 1);
        newFavs.splice(tgtIdx, 0, srcCode);
        saveFavourites(newFavs, () => renderManageTab(newFavs));
      });
    });

    container.appendChild(item);
  });
}

// ── Main init ──
resolveActiveTab(tab => {
  const url = tab.url || '';

  const activeCode = detectLocale(url);
  const activeLocale = LOCALE_MAP[activeCode];
  document.getElementById('current-code').textContent = activeCode || '(none)';
  document.getElementById('current-name').textContent = activeLocale ? activeLocale.name : '';

  loadFavourites(favs => {
    renderSwitchTab(activeCode, favs, '');
    renderManageTab(favs);
  });

  // Search filter
  const searchEl = document.getElementById('search');
  searchEl.addEventListener('input', () => {
    loadFavourites(favs => {
      renderSwitchTab(activeCode, favs, searchEl.value);
    });
  });
  searchEl.focus();

  // ── Keyboard navigation state ──
  let highlightedIndex = -1;

  function getVisibleItems() {
    return Array.from(document.querySelectorAll('#locale-list .locale-item'));
  }

  function setHighlight(idx) {
    const items = getVisibleItems();
    items.forEach(i => i.classList.remove('kb-highlight'));
    if (idx < 0 || idx >= items.length) {
      highlightedIndex = -1;
      return;
    }
    highlightedIndex = idx;
    items[idx].classList.add('kb-highlight');
    items[idx].scrollIntoView({ block: 'nearest' });
  }

  // Reset highlight whenever list re-renders
  const origRender = renderSwitchTab;
  searchEl.addEventListener('input', () => {
    highlightedIndex = -1;
  });

  document.addEventListener('keydown', e => {
    const items = getVisibleItems();

    // Tab cycles through results when search has text
    if (e.key === 'Tab' && searchEl.value !== '') {
      e.preventDefault();
      if (items.length === 0) return;
      const next = e.shiftKey
        ? (highlightedIndex <= 0 ? items.length - 1 : highlightedIndex - 1)
        : (highlightedIndex + 1) % items.length;
      setHighlight(next);
      return;
    }

    // ArrowDown / ArrowUp also navigate
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(highlightedIndex + 1 >= items.length ? 0 : highlightedIndex + 1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(highlightedIndex <= 0 ? items.length - 1 : highlightedIndex - 1);
      return;
    }

    // Enter: pick highlighted item, or first item if nothing highlighted
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = highlightedIndex >= 0 ? items[highlightedIndex] : items[0];
      if (target) navigateTo(target.dataset.code);
      return;
    }

    // 1–9 picks favourites when search is empty
    const digit = parseInt(e.key);
    if (!isNaN(digit) && digit >= 1 && digit <= 9 && searchEl.value === '') {
      loadFavourites(favs => {
        const code = favs[digit - 1];
        if (code) navigateTo(code);
      });
      return;
    }

    if (e.key === 'Escape') window.close();
  });

  // Tab switching
  const tabSwitch = document.getElementById('tab-switch');
  const tabManage = document.getElementById('tab-manage');
  const viewSwitch = document.getElementById('view-switch');
  const viewManage = document.getElementById('view-manage');

  tabSwitch.addEventListener('click', () => {
    tabSwitch.classList.add('active');
    tabManage.classList.remove('active');
    viewSwitch.style.display = 'flex';
    viewManage.style.display = 'none';
    searchEl.focus();
  });

  tabManage.addEventListener('click', () => {
    tabManage.classList.add('active');
    tabSwitch.classList.remove('active');
    viewSwitch.style.display = 'none';
    viewManage.style.display = 'flex';
    loadFavourites(favs => renderManageTab(favs));
  });

  // Shortcut link — can't navigate chrome:// pages, so copy to clipboard hint
  document.getElementById('shortcuts-link').addEventListener('click', e => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    window.close();
  });
});

if (typeof module !== 'undefined') {
  module.exports = { detectLocale, switchUrl, isStressless, LOCALES, LOCALE_MAP, LOCALE_RE };
}
