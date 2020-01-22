import { logger } from './logger';
import { SQLiteHelper } from './sqliteHelper';

export async function initData(db: SQLiteHelper) {
  try {
    await db.run('CREATE TABLE IF NOT EXISTS global_kv (key TEXT PRIMARY KEY, value TEXT)');
    await db.run('INSERT OR REPLACE INTO global_kv (key, value) VALUES ("version", "1")');
    await db.run(`
        CREATE TABLE IF NOT EXISTS images_entity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL,
            created_at DATETIME NOT NULL
        )
    `);
  } catch (err) {
    logger.fatal('init data failed: ', err);
    process.exit(1);
  }
}

export interface ImageEntity {
  id?: number;
  path: string;
  datetime: Date;
}

export async function insertImageEntity(db: SQLiteHelper, entity: ImageEntity): Promise<number> {
  const stmt = await db.prepare('INSERT INTO images_entity (path, created_at) VALUES (?, ?)');
  await stmt.run(entity.path, entity.datetime);
  const { id } = await db.get('SELECT id FROM images_entity WHERE path=?', entity.path);
  await stmt.finalize();
  return id;
}
