import * as os from 'os';
import { ChildProcess, spawn } from 'child_process';
import { join } from 'path';
import { logger } from './logger';
import { createWriteStream } from 'fs';
import { getLogsFolder } from './dataFolder';
import { easyipc } from './easyipc/easyipc';
import { MessageType, GenerateThumbnailsRequest, ThumbnailType,
  GenerateThumbnailsResponse, ReadExifRequest, ExifInfo } from 'protos/ipc_pb';
import { BufferToUint8Array, Uint8ArrayToBuffer, isWindows } from './utils';

const __PACK_DIR__: string = '__PACK_DIR__'; // wil be replaced

interface ServiceBinaryPath {
  thumbnails: string;
}

let binaryName = 'thumbnail';
if (isWindows()) {
  binaryName = 'ani-thumbnail.exe';
}

const defaultPath: ServiceBinaryPath = {
  thumbnails: join(__PACK_DIR__, 'bin', os.platform(), binaryName),
}

export class MicroService {

  private __path: ServiceBinaryPath;
  private __thumbnailsCp: ChildProcess = null;

  initialize(path?: Partial<ServiceBinaryPath>) {
    this.__path = {
      ...defaultPath,
      ...path,
    };
  }

  startAllServices() {
    this.startThumbnailsService();
  }

  startThumbnailsService() {
    this.__thumbnailsCp = spawn(this.__path.thumbnails, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.__thumbnailsCp.on('error', (err) => {
      logger.error('failed to start thumbnails service: ', err);
    });

    const stdOutLogPath = join(getLogsFolder(), 'thumbnails_stdout.log');
    const stdOutStream = createWriteStream(stdOutLogPath);

    const stdErrLogPath = join(getLogsFolder(), 'thumbnails_stderr.log');
    const stdErrStream = createWriteStream(stdErrLogPath);

    this.__thumbnailsCp.stdout.pipe(stdOutStream);
    this.__thumbnailsCp.stderr.pipe(stdErrStream);
  }

  async generateThumbnails(path: string, outDir: string): Promise<GenerateThumbnailsResponse> {
    const client = new easyipc.IpcClient();
    try {
      await client.connect('thumbnail-service');

      const msg = new GenerateThumbnailsRequest();
      msg.setPath(path);
      msg.setOutDir(outDir);
      msg.addTypes(ThumbnailType.SMALL);
      msg.addTypes(ThumbnailType.MEDIUM);
      msg.addTypes(ThumbnailType.LARGE);
      const buf = msg.serializeBinary();
      const respBuf = await client.sendMessage(MessageType.GENERATETHUMBNAILS, Uint8ArrayToBuffer(buf));
      return GenerateThumbnailsResponse.deserializeBinary(BufferToUint8Array(respBuf));
    } catch (err) {
      logger.error('generateThumbnails: ', err);
      throw err;
    } finally {
      client.close();
    }
  }

  async readExif(path: string): Promise<ExifInfo> {
    const client = new easyipc.IpcClient();
    try {
      await client.connect('thumbnail-service');

      const msg = new ReadExifRequest();
      msg.setPath(path);
      const sendBuf = msg.serializeBinary();
      const respBuf = await client.sendMessage(MessageType.READEXIF, Uint8ArrayToBuffer(sendBuf));
      return ExifInfo.deserializeBinary(BufferToUint8Array(respBuf));
    } catch (err) {
      logger.error('readExif: ', err);
      throw err;
    } finally {
      client.close();
    }
  }

}

const singleton = new MicroService();

export default singleton;
