import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import os from 'os';

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;

const preload = path.join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL as string;
const indexHtml = path.join(__dirname, '../dist/index.html');

async function createWindow() {
  win = new BrowserWindow({
    title: 'NeuroDeck',
    width: 1200,
    height: 800,
    backgroundColor: '#0B0F1A', // bg-primary from design system
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Required for some deep file system interactions if we aren't careful, but we should try to keep it enabled if possible. For now false is safer for local file access via main process.
    },
    // Hide menu bar by default for minimal look
    autoHideMenuBar: true,
    frame: true, // Keep native frame for now, can be custom later
    show: true, // Show immediately for debugging, can revert to false later
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('[Main] Running in development mode, loading http://127.0.0.1:5173');
    // Load the url of the dev server if in development mode
    await win.loadURL('http://127.0.0.1:5173');
    win.webContents.openDevTools();
  } else {
    await win.loadFile(indexHtml);
  }

  // Eliminate visual flash
  win.once('ready-to-show', () => {
    console.log('[Main] Window ready-to-show event fired');
    win?.show();
    win?.focus();
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.on('closed', () => {
    win = null;
  });
}

import { setupIpc } from './ipc';
import { initScheduler } from './scheduler';
import { store } from '../lib/store';

app.whenReady().then(async () => {
  console.log('[Main] App is ready, initializing storage...');
  await store.init();

  console.log('[Main] Initializing IPC...');
  setupIpc();

  console.log('[Main] Creating window...');
  await createWindow();

  if (win) {
    console.log('[Main] Window created, initializing scheduler...');
    initScheduler(win);

    // Forced show after a small delay if ready-to-show didn't fire
    setTimeout(() => {
      if (win && !win.isVisible()) {
        console.log('[Main] Forcing window show (fallback)...');
        win.show();
      }
    }, 3000);
  }
});

app.on('window-all-closed', () => {
  win = null;
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
