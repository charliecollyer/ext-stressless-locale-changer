chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "open-switcher-global") return;
  try {
    await chrome.action.openPopup();
  } catch {
    // openPopup() is unavailable on Chrome 118-126 and when Chrome isn't focused.
    // Open popup.html as a standalone window instead, passing the active tab's
    // context so popup.js knows which tab to read from and navigate.
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const params = new URLSearchParams();
    if (tab?.url) params.set("tabUrl", tab.url);
    if (tab?.id != null) params.set("tabId", String(tab.id));
    if (tab?.windowId != null) params.set("windowId", String(tab.windowId));
    const qs = params.toString();
    await chrome.windows.create({
      url: chrome.runtime.getURL("popup.html") + (qs ? "?" + qs : ""),
      type: "popup",
      width: 340,
      height: 580,
    });
  }
});
