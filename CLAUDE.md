# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run all tests
npm test

# Run a single test by name
npx jest --testNamePattern="replaces existing locale segment"
```

Tests require `npm install` on first run (installs Jest). There is no build step — the extension is loaded unpacked directly from `stressless-switcher/`.

## Architecture

This is a Manifest V3 Chrome extension. All UI logic lives in two files:

**`stressless-switcher/popup.js`** — the entire app. Loaded by `popup.html`. Key sections:
- `LOCALES` array (top of file) — the single source of truth for all 31 locales. Each entry: `{ group, code, name }`. `LOCALE_MAP` is derived from it for O(1) lookup.
- `renderSwitchTab(activeCode, favs, filter)` — re-renders the full locale list on every input event. Favourites section appears only when `filter` is empty. Search results section always runs (even unfiltered).
- `makeLocaleItem(locale, activeCode, favs, shortcutNum, isSearchBadge)` — creates a single locale row DOM element. `shortcutNum` controls the badge (1–9 for favourites, ⇧1–⇧9 for search results). All click/fav logic is attached here.
- Keyboard handler (`keydown` on `document`) — Tab/Shift+Tab cycle results, Arrow keys navigate, Enter picks, Shift+1–9 jumps to Nth search result, 1–9 jumps to Nth favourite (only when search empty), Escape closes.
- Favourites are persisted via `chrome.storage.local` (array of locale codes). Always loaded async via `loadFavourites(cb)`.

**`stressless-switcher/background.js`** — service worker. Handles the `open-switcher-global` command (system-wide shortcut). Falls back to opening `popup.html` as a standalone window when `chrome.action.openPopup()` is unavailable, passing `tabUrl`/`tabId`/`windowId` as query params. `popup.js` reads these params on init via `_paramTabUrl` etc. to target the correct tab.

**`popup.test.js`** (repo root) — Jest tests for the pure functions exported from `popup.js`: `detectLocale`, `switchUrl`, `isStressless`, `LOCALES`, `LOCALE_MAP`. Mocks the `chrome` global before requiring the module.

## Key constraints

- Adding a new locale requires only adding an entry to the `LOCALES` array in `popup.js`. `LOCALE_MAP` and `LOCALE_RE` are derived automatically. The regex (`LOCALE_RE`) matches locale codes as URL path segments on `stressless.com`.
- The extension has no build tooling, bundler, or TypeScript. Plain JS only.
- `chrome.storage.local` is always async — never assume favourites are available synchronously.
