import { app, BrowserWindow, Menu, MenuItem, ipcMain } from "electron";
import { eventBus, MainProcessEvents } from './events';
import { getAppDateFolder, setDb, getDb, setWebContent, getWebContent } from './utils';
import { importPhotos } from './photos';
import { SQLiteHelper } from './sqliteHelper';
import { ImageWithThumbnails } from 'common/image';
import { ClientMessageType, MessageRequest } from 'common/message';
import { once, get, isUndefined } from 'lodash';
import { logger } from "./logger";
import MicroService from './microService';
import * as dal from './dal';
import * as path from "path";
import * as fs from 'fs';

let mainWindow: Electron.BrowserWindow;

const startMicroService = once(() => {
  MicroService.initialize();
  MicroService.startAllServices();
});

const listenEvents = once(() => {
  eventBus.addListener(MainProcessEvents.ImportPhotos, importPhotos);

  ipcMain.handle(ClientMessageType.GetAllImages, async (event, req: MessageRequest) => {
    const { offset = 0, length = 200 } = req;
    const images = await dal.queryImageEntities(getDb(), offset, length);
    const allPromises: Promise<ImageWithThumbnails>[] = images.map(async img => {
      const thumbnails = await dal.queryThumbnailsByImageId(getDb(), img.id!);
      return {
        ...img,
        thumbnails,
      } as ImageWithThumbnails;
    });
    const content = await Promise.all(allPromises);
    return { content };
  });

  ipcMain.handle(ClientMessageType.ShowContextMenu, async (event, data) => {
    const menu = new Menu()
    menu.append(new MenuItem({
      label: 'Delete', 
      click: async () => {
        try {
          const imageId = get(data, 'imageId');
          if (isUndefined(imageId)) return;
          logger.info('preparing to delete image id', imageId);
          await dal.deleteImageById(getDb(), Number(imageId));
          getWebContent().send(ClientMessageType.PhotoDeleted, imageId);
          logger.info('delete image successfully: ', imageId);
        } catch (err) {
          logger.error(err);
        }
      },
    }));
    menu.popup();
  });
});

const showMenu = once(() => {
  const isMac = process.platform === 'darwin';

  const template: any = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: 'AniAlbum',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        {
          label: 'Import',
          click: () => eventBus.emit(MainProcessEvents.ImportPhotos),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startspeaking' },
              { role: 'stopspeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    width: 800,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../../index.html"));

  mainWindow.webContents.on('did-finish-load', () => {
    setWebContent(mainWindow.webContents);
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  const appDataFolder = getAppDateFolder();
  if (!fs.existsSync(appDataFolder)) {
    fs.mkdirSync(appDataFolder);
  }
  const databasePath = path.join(appDataFolder, 'database.sqlite');
  const db = await SQLiteHelper.create(databasePath);
  setDb(db);

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  showMenu();

  startMicroService();

  listenEvents();
  
  dal.initData(db);
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
