import * as fs from 'fs';
import * as os from 'os';
import { join } from 'path';

export function getAppDateFolder(): string {
  const home = os.homedir();
  return join(home, 'Library', 'Application Support', 'SmartNotebook');
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
