import * as sqlite3 from 'sqlite3';

export function initData(db: sqlite3.Database) {
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS global_kv (key TEXT PRIMARY KEY, value TEXT)');
    db.run('INSERT OR REPLACE INTO global_kv (key, value) VALUES ("version", "1")');
    db.run(`
        CREATE TABLE IF NOT EXISTS images_entity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL,
            created_at DATETIME NOT NULL,
        )
    `);
  });
}

export interface ImageEntity {
  id?: number;
  path: string;
  datetime: Date;
}

export function insertImageEntity(db: sqlite3.Database, entity: ImageEntity) {
  db.serialize(() => {
    const stmt = db.prepare('INSERT INTO images_entity (path, created_at) VALUES (?, now())');
    stmt.run(entity.path);
    stmt.finalize();
  });
}
