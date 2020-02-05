// @ts-ignore for no d.ts
import ElectronReload from 'electron-reload';
import isDev from 'electron-is-dev';
import { app, BrowserWindow, Menu, MenuItem, ipcMain, IpcMainInvokeEvent, IpcMain } from 'electron';
import { eventBus, MainProcessEvents } from './events';
import initialFolder, { getDatabasePath } from './dataFolder';
import { setDb, getDb, setWebContent, getWebContent, isWindows } from './utils';
import { importPhotos } from './photos';
import { SQLiteHelper } from './sqliteHelper';
import { ImageWithThumbnails } from 'common/image';
import { ClientMessageType, MessageRequest } from 'common/message';
import { once, get, isUndefined } from 'lodash';
import { logger } from './logger';
import { showMenu } from './menu';
import MicroService from './microService';
import * as dal from './dal';
import * as path from 'path';
import { Album } from 'common/album';
import { Workspace } from 'common/workspace';

let mainWindow: Electron.BrowserWindow;

/**
 * For dev hot reload
 * Can manually set ELECTRON_IS_DEV=0 in npm scripts
 *   to simulate non-development env (avoid hot reload)
 */
if (isDev) {
  ElectronReload(path.join(__dirname, '../renderer'));
}

const startMicroService = once(() => {
  MicroService.initialize();
  MicroService.startAllServices();
});

const listenEvents = once(() => {
  eventBus.addListener(MainProcessEvents.ImportPhotos, importPhotos);

  ipcMain.handle(ClientMessageType.GetAllImages, async (event: IpcMainInvokeEvent, req: MessageRequest) => {
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

  ipcMain.handle(ClientMessageType.GetImageById, async (event: IpcMainInvokeEvent, imageId: number) => {
    const image = await dal.queryImageById(getDb(), imageId);
    const thumbnails = await dal.queryThumbnailsByImageId(getDb(), imageId);
    return {
      ...image,
      thumbnails,
    };
  });

  ipcMain.handle(ClientMessageType.ShowContextMenu, async (event: IpcMainInvokeEvent, data) => {
    const menu = new Menu();
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

  ipcMain.handle(ClientMessageType.CreateAlbum, async (event: IpcMainInvokeEvent) => {
    const album: Album = {
      name: 'Untitled Album',
      description: null,
      createdAt: new Date(),
    };
    const id = await dal.insertAlbum(getDb(), album);
    album.id = id;
    return album;
  });

  ipcMain.handle(ClientMessageType.GetAllAlbums, async (event: IpcMainInvokeEvent) => {
    return await dal.queryAlbums(getDb());
  });

  ipcMain.handle(ClientMessageType.GetAlbumById, async (event: IpcMainInvokeEvent, id: number) => {
    return await dal.queryAlbumById(getDb(), id);
  });

  ipcMain.handle(ClientMessageType.UpdateAlbumById, async (event: IpcMainInvokeEvent, album: Album) => {
    return await dal.updateAlbumById(getDb(), album);
  });

  ipcMain.handle(ClientMessageType.CreateWorkspace, async (event: IpcMainInvokeEvent, parentId: number) => {
    const wp: Workspace = {
      name: 'Untitled Workspace',
      parentId,
      createdAt: new Date(),
    };
    const id = await dal.insertWorkspace(getDb(), wp);
    wp.id = id;
    return wp;
  });

  ipcMain.handle(ClientMessageType.GetWorkspacesByParentId, async (event: IpcMainInvokeEvent, parentId: number) => {
    return await dal.queryWorkspacesByParentId(getDb(), parentId);
  });

  ipcMain.handle(ClientMessageType.AddImageToAlbum, async (event: IpcMainInvokeEvent, imageId: number, albumId: number) => {
    return await dal.addImageToAlbum(getDb(), imageId, albumId);
  });

  ipcMain.handle(ClientMessageType.GetImagesByAlbumId, async (event: IpcMainInvokeEvent, albumId: number) => {
    logger.debug('GetImagesByAlbumId: ', albumId);
    return await dal.queryImagesByAlbumId(getDb(), albumId);
  });

});

async function createWindow() {
  let frame: boolean = false;
  if (isWindows()) {
    frame = true;
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    frame,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../../index.html'));

  mainWindow.webContents.on('did-finish-load', () => {
    setWebContent(mainWindow.webContents);
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on('enter-full-screen', () => {
    getWebContent().send(ClientMessageType.ToggleFullscreen, true);
  });

  mainWindow.on('leave-full-screen', () => {
    getWebContent().send(ClientMessageType.ToggleFullscreen, false);
  });
  
  ipcMain.on('close', () => {
    mainWindow = null;
    app.quit();
  });

  ipcMain.on('min', () => {
    mainWindow.minimize();
  });

  ipcMain.on('fullscreen', () => {
    mainWindow.setFullScreen(true);
  });

  showMenu();

  listenEvents();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  try {
    initialFolder();
    const databasePath = getDatabasePath();
    const db = await SQLiteHelper.create(databasePath);
    setDb(db);

    await dal.initData(db);
    
    createWindow();

    startMicroService();
  } catch (err) {
    logger.fatal(err);
    process.exit(1);
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
