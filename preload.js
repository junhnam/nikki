const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  saveEntry: (entry) => ipcRenderer.invoke('save-entry', entry),
  getEntries: () => ipcRenderer.invoke('get-entries'),
}); 