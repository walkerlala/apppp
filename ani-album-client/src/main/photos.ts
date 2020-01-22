import { dialog } from 'electron';
import { logger } from './logger';
import { insertImageEntity, insertThumbnailEntity } from './dal';
import { getDb, BufferToUint8Array, Uint8ArrayToBuffer } from './utils';
import { easyipc } from './easyipc/easyipc';
import { MessageType, GenerateThumbnailsRequest, ThumbnailType, GenerateThumbnailsResponse } from 'protos/ipc_pb';
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
        const imageId = await insertImageEntity(getDb(), {
          path,
          datetime: new Date(),
        });

        logger.info(`new entity: `, imageId);

        await client.connect('thumbnail-service');
        const msg = new GenerateThumbnailsRequest();
        msg.setPath(path);
        msg.setOutDir('/tmp/');
        msg.addTypes(ThumbnailType.SMALL);
        msg.addTypes(ThumbnailType.MEDIUM);
        msg.addTypes(ThumbnailType.LARGE);
        const buf = msg.serializeBinary();
        const respBuf = await client.sendMessage(MessageType.GENERATETHUMBNAILS, Uint8ArrayToBuffer(buf));
        const resp = GenerateThumbnailsResponse.deserializeBinary(BufferToUint8Array(respBuf));

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

        logger.info('import a photo');
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
