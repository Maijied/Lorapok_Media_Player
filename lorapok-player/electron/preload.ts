import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
    ipcRenderer.on(channel, listener);
  },
  off: (channel: string, listener: (event: any, ...args: any[]) => void) => {
    ipcRenderer.off(channel, listener);
  },
  invoke: (channel: string, ...args: any[]) => {
    const validChannels = [
      'log-to-file', 'open-file', 'get-gpu-status', 'set-window-size',
      'save-screenshot', 'export-segment', 'copy-to-clipboard',
      'add-watch-folder', 'remove-watch-folder', 'start-local-server',
      'stop-local-server', 'remote-control', 'window-minimize',
      'window-maximize', 'window-close', 'get-video-duration', 'get-media-tracks',
      'scan-directory'
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  }
});
