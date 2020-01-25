import * as os from 'os';
import { join } from 'path';
import { SQLiteHelper} from './sqliteHelper';
import { WebContents } from 'electron';

export function getAppDateFolder(): string {
    const home = os.homedir();
    return join(home, 'Library', 'Application Support', 'SmartNotebook');
}

let global_db: SQLiteHelper;
let globalWebContent: WebContents; 

export function setWebContent(wc: WebContents) {
    globalWebContent = wc;
}

export function getWebContent(): WebContents {
    return globalWebContent;
}

export function setDb(db: SQLiteHelper) {
    global_db = db;
}

export function getDb(): SQLiteHelper {
    return global_db;
}

export function Uint8ArrayToBuffer(arr: Uint8Array): Buffer {
    return Buffer.from(arr.buffer);
}

export function BufferToUint8Array(buffer: Buffer): Uint8Array {
    const uint8Arr = new Uint8Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
        uint8Arr[i] = buffer[i];
    }
    return uint8Arr;
}
