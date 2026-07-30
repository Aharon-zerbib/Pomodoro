import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendNotification: (title: string, body: string) => ipcRenderer.send('notify', { title, body }),
  getMusicTracks: () => ipcRenderer.invoke('get-music-tracks')
});
