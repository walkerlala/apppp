import * as fs from 'fs';
import * as os from 'os';
import { join } from 'path';
import { isWindows, isMacOS } from './utils';

export function getAppDateFolder(): string {
  if (isMacOS()) {
    const home = os.homedir();
    return join(home, 'Library', 'Application Support', 'SmartNotebook');
  } else if (isWindows()) {
    const home = os.homedir();
    return join(home, 'AppData', 'Local', 'SmartNotebook');
  } else {
    throw new Error("not support");
  }
}

export function getLogsFolder(): string {
  const appDataFolder = getAppDateFolder();
  return join(appDataFolder, 'Logs');
}

export function getThumbnailsFolder(): string {
  const appDataFolder = getAppDateFolder();
  return join(appDataFolder, 'Thumbnails');
}

export function getDatabasePath(): string {
  return join(getAppDateFolder(), 'database.sqlite');
}

export function initialFolder() {
  const folders = [
    getAppDateFolder(),
    getLogsFolder(),
    getThumbnailsFolder(),
  ];

  for (const folder of folders) {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
  }
}

export default initialFolder;
