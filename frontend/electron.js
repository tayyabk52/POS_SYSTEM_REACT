const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    x: 100,
    y: 100,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
    show: true,
    alwaysOnTop: false,
  });

  // Load the React build output
  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  
  // Open DevTools for debugging
  // win.webContents.openDevTools();

  // Set zoom factor to 1 (100%) for browser-like appearance
  win.webContents.on('did-finish-load', () => {
    win.webContents.setZoomFactor(1);
    console.log('Page loaded successfully, zoom set to 100%');
    win.focus();
  });

  // Handle load errors
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Handle navigation
  win.webContents.on('will-navigate', (event, navigationUrl) => {
    console.log('Navigation to:', navigationUrl);
  });

  // Ensure window is visible
  win.on('ready-to-show', () => {
    win.show();
    win.focus();
  });
}

app.whenReady().then(() => {
  console.log('Electron app is ready');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 