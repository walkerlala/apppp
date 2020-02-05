import { dialog } from 'electron';
import { logger } from './logger';
import { insertImageEntity, insertThumbnailEntity } from './dal';
import { getDb, getWebContent } from './utils';
import { ClientMessageType } from 'common/message';
import { getThumbnailsFolder } from './dataFolder';
import microService from './microService';
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
    try {
      const imageId = await insertImageEntity(getDb(), {
        path,
        createdAt: new Date(),
      });

      logger.info('new entity: ', imageId);
      const resp = await microService.generateThumbnails(path, getThumbnailsFolder());
      logger.debug('thumbnail resp length: ', resp.getDataList().length);

      for (const thumbnail of resp.getDataList()) {
        logger.debug('get a thumbnail', thumbnail.getPath());
        await insertThumbnailEntity(getDb(), {
          path: thumbnail.getPath(),
          type: thumbnail.getType(),
          imageId,
          width: thumbnail.getWidth(),
          height: thumbnail.getHeight(),
          createAt: new Date(),
        });
      };

      logger.info('imported a photo');
      getWebContent().send(ClientMessageType.PhotoImported);
      // const exifInfo = await microService.readExif(path);
      // logger.info(ExifInfo.toObject(false, exifInfo));
    } catch (err) {
      logger.error('insert photo failed: ', err, 'path: ', path);
    }
  }
}

async function traverseDirToImport(path: string) {
  const children = await fs.promises.readdir(path);
  for (const child of children) {
    await importPhotosByPath(child);
  }
}
