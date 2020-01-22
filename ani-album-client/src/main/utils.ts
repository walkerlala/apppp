import * as os from 'os';
import * as sqlite3 from 'sqlite3';
import { join } from 'path';
import { SQLiteHelper} from './sqliteHelper';

export function getAppDateFolder(): string {
    const home = os.homedir();
    return join(home, 'Library', 'Application Support', 'SmartNotebook');
}

let global_db: SQLiteHelper;

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
