// Initialize context menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "open-in-lorapok",
    title: "Open in Lorapok",
    contexts: ["link", "video", "audio"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-in-lorapok") {
    const url = info.linkUrl || info.srcUrl;
    if (url) {
      const lorapokUrl = `lorapok://${url}`;
      // In Manifest V3, we use chrome.tabs.update or a simple window open if needed,
      // but actually we just want the OS to handle the protocol.
      // Redirecting current tab or opening a temporary one might work.
      
      // Best way to trigger a custom protocol in MV3:
      chrome.tabs.create({ url: lorapokUrl, active: false }, (newTab) => {
        // Close the tab immediately after it triggers the protocol handler
        setTimeout(() => {
          chrome.tabs.remove(newTab.id);
        }, 1000);
      });
    }
  }
});
