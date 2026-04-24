import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import * as path from 'path';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    resizable: true,
    frame: false,
    autoHideMenuBar: true,
    title: "Pomodoro",
    icon: path.join(__dirname, '../../cafe.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../../src/renderer/index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('notify', (_, { title, body }) => {
  new Notification({ title, body }).show();
});
