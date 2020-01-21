import { dialog } from 'electron';
import { logger } from './logger';
import { insertImageEntity } from './dal';
import { getDb } from './utils';
import { easyipc } from './easyipc/easyipc';
import * as fs from 'fs';

export async function importPhotos() {
  try {
    const reuslt = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
    });

    if (reuslt.canceled) return;

    for (const path of reuslt.filePaths) {
      await importPhotosByPath(path);
    }
  } catch (err) {
    logger.error(err);
  }
}

async function importPhotosByPath(path: string) {
    const stat = await fs.promises.lstat(path);
    if (stat.isDirectory()) {
        return await traverseDirToImport(path);
    } else if (stat.isFile()) {
      const client = new easyipc.IpcClient();
      try {
        insertImageEntity(getDb(), {
          path,
          datetime: new Date(),
        });

        await client.connect('thumbnail-service');
        await client.sendMessage(1, Buffer.alloc(1));
        logger.info('insert status');
      } catch (err) {
        logger.error('insert photo failed: ', err, 'path: ', path);
      } finally {
        client.close();
      }
    }
}

async function traverseDirToImport(path: string) {
    const children = await fs.promises.readdir(path);
    for (const child of children) {
        await importPhotosByPath(child);
    }
}
