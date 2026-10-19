const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { syncInternetTime } = require('./internet-time.cjs');
let windowsKeyHelper = null;
function captureWindowsKey(win) {
  if (process.platform !== 'win32') return;
  const handle = win.getNativeWindowHandle();
  const hwnd = handle.length === 8 ? handle.readBigUInt64LE().toString() : String(handle.readUInt32LE());
  windowsKeyHelper = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', path.join(__dirname, 'windows-key.ps1'), '-WindowHandle', hwnd, '-ParentProcessId', String(process.pid)], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let pending = '';
  windowsKeyHelper.stdout.on('data', chunk => {
    pending += chunk.toString();
    const lines = pending.split(/\r?\n/); pending = lines.pop();
    for (const line of lines) {
      const message=line.trim();if(message==='READY')win.windowsKeyReady=true;
      if(['FROM_DOWN','FROM_UP'].includes(message)&&!win.isDestroyed()&&win.isFocused()) {
        win.webContents.executeJavaScript("window.dispatchEvent(new CustomEvent('cabanon-from-key',{detail:{down:"+(message==='FROM_DOWN')+"}}))").catch(console.error);
      }
    }
  });
  windowsKeyHelper.stderr.on('data', chunk => console.error('Windows key:', chunk.toString()));
  windowsKeyHelper.on('error', error => console.error('Windows key:', error));
  win.on('closed', () => { windowsKeyHelper?.kill(); windowsKeyHelper = null; });
}
app.setName('Cabanon OS Prototype');
// Keep the same instance identity for start.cmd and future packaged executables.
// Explicit user-data-dir remains available for isolated automated tests.
if (!app.commandLine.hasSwitch('user-data-dir')) {
  app.setPath('userData', path.join(app.getPath('appData'), 'Cabanon OS Prototype'));
}
let mainWindow = null;
let loadedUiVersion = null;
function uiVersion() {
  return fs.readdirSync(__dirname).filter(name => /\.(?:html|css|js|cjs|ps1)$/.test(name)).sort().map(name => { const info = fs.statSync(path.join(__dirname, name)); return name + ":" + info.size + ":" + info.mtimeMs; }).join("|");
}
function focusExistingWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
  const version = uiVersion();
  if (loadedUiVersion && version !== loadedUiVersion && !mainWindow.webContents.isLoading()) {
    loadedUiVersion = version;
    mainWindow.webContents.executeJavaScript("if(typeof flushFileUndo==='function')flushFileUndo();if(typeof flushProfiles==='function')flushProfiles();").then(() => {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.reloadIgnoringCache();
    }).catch(console.error);
  }
}
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
app.on('second-instance', focusExistingWindow);
app.whenReady().then(() => {
  const win = new BrowserWindow({ icon: path.join(__dirname, 'from-app.png'), width: 1920, height: 1080, fullscreen: true, frame: false, backgroundColor: '#0e100f', webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  mainWindow = win;
  win.removeMenu();
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', event => event.preventDefault());
  ipcMain.on('home:close', () => win.close());
  ipcMain.handle('home:copy-path', (_event, text) => { if(typeof text==='string')clipboard.writeText(text); });
  ipcMain.handle('home:sync-time', () => syncInternetTime());
  ipcMain.handle('home:storage-usage', async () => {try{const stats=await fs.promises.statfs(app.getPath('userData'));const total=Number(stats.blocks)*Number(stats.bsize),free=Number(stats.bavail)*Number(stats.bsize);return{ok:true,total,free,used:total-free,volume:path.parse(app.getPath('userData')).root};}catch(error){return{ok:false,error:error.message};}});
  ipcMain.handle('home:clear-cache', async () => {try{await win.webContents.session.clearCache();return{ok:true};}catch(error){return{ok:false,error:error.message};}});

  loadedUiVersion = uiVersion();
  win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.on('did-finish-load', () => { loadedUiVersion = uiVersion(); });
  win.webContents.once('did-finish-load', () => captureWindowsKey(win));
});
app.on('will-quit', () => windowsKeyHelper?.kill());
app.on('window-all-closed', () => app.quit());
}

