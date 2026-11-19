# TODO

## Publish automatically to the Microsoft Edge Add-ons store

**Status:** not started

Set up automatic publishing of this extension to the Microsoft Edge Add-ons store using a GitHub Action.

### Context

- I use Microsoft Edge, not Chrome. The extension lives in `stressless-switcher/` (Manifest V3, plain JS, no build step).
- I want to publish it as a **hidden** listing on the Edge Add-ons store, which is free.
- I want to avoid anything that costs money.

### What I want

1. **A GitHub Actions workflow** in `.github/workflows/` that:
   - [ ] runs when I push a version tag (e.g. `v1.2.0`)
   - [ ] runs `npm test` first and stops if the tests fail
   - [ ] checks that the tag matches the `"version"` in `stressless-switcher/manifest.json`
   - [ ] zips the contents of `stressless-switcher/` (with `manifest.json` at the root of the zip)
   - [ ] uploads the zip with the Microsoft Edge Add-ons publishing API and submits it for review
   - [ ] reads all credentials from GitHub repository secrets, never hard-coded

2. **Check the API docs first.** Before writing the workflow, check the current Microsoft Edge Add-ons publishing API docs so the endpoints and auth method are up to date. Tell me if anything has changed from what you expected.

3. **A short step-by-step guide** for someone non-technical, in a new file `docs/PUBLISHING.md`, covering:
   - [ ] registering a free developer account in Microsoft Partner Center
   - [ ] doing the first submission by hand, if the API can only update an existing listing
   - [ ] setting the listing to hidden
   - [ ] getting the API credentials and adding them as GitHub secrets (with the exact secret names the workflow uses)
   - [ ] how to release an update: bump the version in `manifest.json`, commit, tag, push

4. **README link.** Add a link to the new guide in `README.md`.

### How to pick this up

Start a new session and say: "Do the Edge Add-ons publishing task in TODO.md." Remove this section from the file (or tick everything off) when it's done.

---

## Reference: Safari extension prompt (for my own use — not a task)

> **Note for Claude:** this section is a saved prompt for me to copy and use elsewhere later. Do not work on it or act on it.

```text
Build a Safari web extension called "Stressless Locale Switcher".

PURPOSE
It's a productivity tool for quickly switching the current stressless.com page between country/language versions of the site. stressless.com URLs contain a locale code as a path segment, for example:
  https://www.stressless.com/[LOCALE-CODE]/some/page
Switching locale keeps the rest of the URL exactly the same and replaces only the locale segment, then loads the new URL in the same tab.

LOCALES
There are 31 locales. Each has a group (shown as a heading in the list), a code (the URL segment) and a display name. Keep them in one array in the code so adding a new locale only means adding one entry. Here is the full list:
[PASTE THE LOCALES LIST HERE: group, code, name for each one]
Example of the format, for the French group:
  Group "🇫🇷 French": France, Canada, Belgium, Switzerland (each with its own locale code)

POPUP LAYOUT
1. Header: shows the locale detected from the current tab's URL (its code and name), or "(none)" if the page isn't a stressless.com page with a recognised locale.
2. Two tabs at the top: "Switch" and "Manage favourites".
3. Switch tab:
   - A search box at the top that is focused automatically when the popup opens. Placeholder text: "Filter… (1–9 to pick result or favourite)".
   - Below it, the locale list:
     a. When the search box is empty and the user has favourites, a "★ Favourites" section appears first, listing favourites in the user's chosen order, numbered 1–9.
     b. Then all locales, grouped under their group headings.
   - Each row shows: a small number badge, the locale code (monospace), the locale name, and a star button to add or remove it as a favourite.
   - The locale that matches the current page is highlighted as "active".
   - Typing in the search box filters the list as you type. Matching is case-insensitive and checks the locale code, name and group name. For example, typing "fre" shows French: France, Canada, Belgium, Switzerland.
   - While searching, the favourites section is hidden and the first 9 matching results get number badges 1–9 in the order they appear.
   - If nothing matches, show a "No results" message.
   - Clicking any row switches to that locale.
4. Manage favourites tab:
   - Lists favourites in order, each with its number, code, name, a drag handle (⠿) and a remove (×) button.
   - Favourites can be reordered by drag and drop. The order sets their 1–9 shortcut numbers.
   - If there are no favourites, show: "No favourites yet. Star locales in the Switch tab."
   - A link to the browser's keyboard-shortcut settings page.

KEYBOARD CONTROLS (inside the popup)
- Typing filters the list.
- Number keys 1–9 (top row or numpad, with or without Shift):
  - while the search box has text: switch to the Nth result in the visible list
  - while the search box is empty: switch to the Nth favourite
  - number keys never type into the search box, because no locale code or name contains a digit
  - ignore numbers pressed together with Ctrl, Cmd or Alt
- Tab / Shift+Tab (while searching) and Up/Down arrows: move a highlight up and down the list, wrapping round at the ends. Reset the highlight whenever the search text changes.
- Enter: switch to the highlighted row, or to the first row if nothing is highlighted.
- Escape: close the popup.

OPENING THE POPUP
- A keyboard shortcut opens it: Alt+Shift+L by default (Option+Shift+L on Mac), user-customisable.
- If the platform supports it, an optional second, system-wide shortcut with no default key. If the popup can't be opened programmatically, open the popup page in a small standalone window instead, passing the target tab's URL and ID so switching still affects the right tab.

FAVOURITES STORAGE
- Save favourites as an ordered array of locale codes in the extension's local storage (browser.storage.local), so they persist between sessions.
- Storage reads are asynchronous; never assume favourites are available immediately.

TECHNICAL REQUIREMENTS
- Manifest V3 web extension, plain JavaScript, HTML and CSS, with no frameworks, bundlers or build step.
- Permissions: only what's needed (tabs/activeTab and storage, plus host access to stressless.com if required).
- Keep these as pure, testable functions:
  - detectLocale(url): returns the locale code found in a stressless.com URL, or null
  - switchUrl(url, newCode): returns the URL with the locale segment replaced
  - isStressless(url): returns true if the URL is a stressless.com page
- Style: compact dark theme, small fonts (about 12px), monospace for locale codes, a blue accent for the active locale and for number badges.
```
