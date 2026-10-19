const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('cabanon', { close: () => ipcRenderer.send('home:close'), copyPath: text => ipcRenderer.invoke('home:copy-path',text), syncTime: () => ipcRenderer.invoke('home:sync-time'), storageUsage: () => ipcRenderer.invoke('home:storage-usage'), clearCache: () => ipcRenderer.invoke('home:clear-cache') });
