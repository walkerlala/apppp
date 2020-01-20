import * as os from 'os';
import { join } from 'path';
import * as sqlite3 from 'sqlite3';

export function getAppDateFolder(): string {
    const home = os.homedir();
    return join(home, 'Library', 'Application Support', 'SmartNotebook');
}

let global_db: sqlite3.Database;

export function setDb(db: sqlite3.Database) {
    global_db = db;
}

export function getDb(): sqlite3.Database {
    return global_db;
}
