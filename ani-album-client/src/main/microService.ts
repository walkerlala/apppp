import { ChildProcess, spawn } from 'child_process';
import { join } from 'path';
import { logger } from './logger';
import { createWriteStream } from 'fs';
import { getLogsFolder } from './utils';

const __PACK_DIR__: string = '__PACK_DIR__'; // wil be replaced

interface ServiceBinaryPath {
  thumbnails: string;
}

const defaultPath: ServiceBinaryPath = {
  thumbnails: join(__PACK_DIR__, 'bin', 'thumbnail'),
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

}

const singleton = new MicroService();

export default singleton;
