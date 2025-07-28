const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const dbPath = require('path').join(app.getPath('userData'), 'nikki.db');
const db = new Database(dbPath);

const isDev = !app.isPackaged;

db.pragma('journal_mode = WAL');
db.prepare(`CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  mood TEXT NOT NULL,
  gratitude TEXT,
  achievement TEXT,
  createdat TEXT NOT NULL,
  updatedat TEXT NOT NULL
)`).run();

// 日記エントリを保存
ipcMain.handle('save-entry', (event, entry) => {
  const now = new Date().toISOString();
  const stmt = db.prepare(`INSERT INTO entries (date, mood, gratitude, achievement, createdat, updatedat)
    VALUES (?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(
    entry.date,
    entry.mood,
    entry.gratitude || '',
    entry.achievement || '',
    now,
    now
  );
  return { id: info.lastInsertRowid };
});

// 日記エントリ一覧を取得
ipcMain.handle('get-entries', () => {
  const stmt = db.prepare('SELECT * FROM entries ORDER BY date DESC');
  return stmt.all();
});

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    resizable: false,
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
}); 