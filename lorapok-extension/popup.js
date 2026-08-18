// Popup script for Lorapok Connector

async function scanActiveTab() {
  const mediaListContainer = document.getElementById('media-list');
  mediaListContainer.innerHTML = '<div class="empty-state">Scanning active page for video & audio streams...</div>';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      mediaListContainer.innerHTML = '<div class="empty-state">No active tab found.</div>';
      return;
    }

    // Execute script in tab to extract media sources
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const found = new Set();
        // Check video elements
        document.querySelectorAll('video, audio').forEach(el => {
          if (el.src) found.add(el.src);
          if (el.currentSrc) found.add(el.currentSrc);
          el.querySelectorAll('source').forEach(s => {
            if (s.src) found.add(s.src);
          });
        });
        // Check links matching media patterns
        document.querySelectorAll('a[href]').forEach(a => {
          const href = a.href;
          if (/\.(mp4|m3u8|mpd|webm|mkv|avi|mov|flv|ts|mp3|flac|wav|aac)(\?.*)?$/i.test(href)) {
            found.add(href);
          }
        });
        return Array.from(found);
      }
    });

    const mediaUrls = results?.[0]?.result || [];

    if (mediaUrls.length === 0) {
      mediaListContainer.innerHTML = `
        <div class="empty-state">
          No direct media streams found on this tab.<br>
          <span style="font-size: 10px; color: #4b5563;">You can right-click any video or link and select <b>Open in Lorapok</b>.</span>
        </div>
      `;
      return;
    }

    mediaListContainer.innerHTML = '';
    mediaUrls.forEach((url, idx) => {
      const item = document.createElement('div');
      item.className = 'media-item';

      const urlText = document.createElement('div');
      urlText.className = 'media-url';
      urlText.title = url;
      urlText.textContent = url;

      const actions = document.createElement('div');
      actions.className = 'media-actions';

      // Desktop App Button
      const btnDesktop = document.createElement('button');
      btnDesktop.className = 'btn btn-primary';
      btnDesktop.textContent = '🚀 Open App';
      btnDesktop.onclick = () => {
        chrome.tabs.create({ url: `lorapok://${url}`, active: false }, (newTab) => {
          setTimeout(() => chrome.tabs.remove(newTab.id), 1000);
        });
      };

      // Web Player Button
      const btnWeb = document.createElement('a');
      btnWeb.className = 'btn btn-secondary';
      btnWeb.textContent = '🌐 Web Player';
      btnWeb.href = `https://media.lorapok.tech/?stream=${encodeURIComponent(url)}`;
      btnWeb.target = '_blank';

      // Copy Button
      const btnCopy = document.createElement('button');
      btnCopy.className = 'btn btn-secondary';
      btnCopy.textContent = '📋 Copy';
      btnCopy.onclick = () => {
        navigator.clipboard.writeText(url);
        btnCopy.textContent = '✅ Copied';
        setTimeout(() => btnCopy.textContent = '📋 Copy', 1500);
      };

      actions.appendChild(btnDesktop);
      actions.appendChild(btnWeb);
      actions.appendChild(btnCopy);

      item.appendChild(urlText);
      item.appendChild(actions);
      mediaListContainer.appendChild(item);
    });

  } catch (err) {
    mediaListContainer.innerHTML = `
      <div class="empty-state" style="color: #ef4444;">
        Unable to scan this page (restricted browser URL).<br>
        <span style="font-size: 10px; color: #9ca3af;">Right-click media links to send to Lorapok.</span>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  scanActiveTab();
  document.getElementById('btn-refresh').addEventListener('click', scanActiveTab);
});
