import { app, BrowserWindow, Menu, MenuItem } from "electron";
import { getAppDateFolder } from './utils';
import * as path from "path";
import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';

let mainWindow: Electron.BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: 800,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../../index.html"));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  const appDataFolder = getAppDateFolder();
  if (!fs.existsSync(appDataFolder)) {
    fs.mkdirSync(appDataFolder);
  }
  const databasePath = path.join(appDataFolder, 'database.sqlite');
  const db = new sqlite3.Database(databasePath);

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  showMenu();
  
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS global_kv (key TEXT PRIMARY KEY, value TEXT)');
    db.run('INSERT OR REPLACE INTO global_kv (key, value) VALUES ("version", "1")');
  });

}

function showMenu() {
  const menu = new Menu();
  menu.append(new MenuItem({ label: 'MenuItem1', click() { console.log('item 1 clicked') } }))
  menu.append(new MenuItem({ type: 'separator' }))
  menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }))
  // Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
