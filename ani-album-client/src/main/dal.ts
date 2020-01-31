/**
 * Data Access Layer
 */
import { ImageEntity, ThumbnailEntity } from 'common/image';
import { Album } from 'common/album';
import { logger } from './logger';
import { SQLiteHelper } from './sqliteHelper';
import { once, isUndefined } from 'lodash';

const GlobalKvTableName = 'globalKv';
const ImageEntityTableName = 'imagesEntity';
const ThumbnailsTableName = 'thumbnails';
const AlbumsTableName = 'albums';

export const initData = once(async (db: SQLiteHelper) => {
  try {
    await db.run(`CREATE TABLE IF NOT EXISTS ${GlobalKvTableName} (key TEXT PRIMARY KEY, value TEXT)`);
    const dbVersionResult = await db.get(`SELECT value FROM ${GlobalKvTableName} WHERE key="version"`);

    let dbVersion: number = 1;
    if (isUndefined(dbVersionResult)) {
      await db.run(`INSERT OR REPLACE INTO ${GlobalKvTableName} (key, value) VALUES ("version", "1")`);
      await db.run(`
        CREATE TABLE IF NOT EXISTS ${ImageEntityTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL,
            createdAt DATETIME NOT NULL
        )
      `);
      await db.run(`
        CREATE TABLE IF NOT EXISTS ${ThumbnailsTableName} (
          path TEXT PRIMARY KEY,
          type INTEGER NOT NULL,
          imageId INTEGER NOT NULL,
          width INTEGER NOT NULL,
          height INTEGER NOT NULL,
          createdAt DATETIME NOT NULL
        )
      `);
    } else {
      dbVersion = Number(dbVersionResult.value);
    }

    if (dbVersion === 1) {
      await upgradeToVersion2(db);
      dbVersion = 2;
    }
    
    logger.info('db version: ', dbVersion);
  } catch (err) {
    logger.fatal('init data failed: ', err);
    process.exit(1);
  }
});

async function upgradeToVersion2(db: SQLiteHelper) {
  logger.info('upgrade database to version 2');
  await db.run(`
    CREATE TABLE If NOT EXISTS ${AlbumsTableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      createdAt DATETIME NOT NULL
    )
  `);
  await db.run(`INSERT OR REPLACE INTO ${GlobalKvTableName} (key, value) VALUES ("version", "2")`);
}

export async function insertAlbum(db: SQLiteHelper, album: Album): Promise<number> {
  const stmt = await db.prepare(`INSERT INTO ${AlbumsTableName} (name, description, createdAt) VALUES (?, ?, ?)`);
  const { name, description, createdAt } = album;
  await stmt.run(name, description, createdAt);
  await stmt.finalize();
  const { id } = await db.get(`SELECT id FROM ${AlbumsTableName} WHERE name=? AND createdAt=?`, name, createdAt);
  return id;
}

export async function queryAlbums(db: SQLiteHelper): Promise<Album[]> {
  const result = await db.all(`
    SELECT id, name, description, createdAt FROM ${AlbumsTableName}
    ORDER BY createdAt DESC
  `);
  return result.map(({ createdAt, ...rest }) => ({
    ...rest,
    createdAt: new Date(createdAt),
  }));
}

export async function queryImageEntities(
  db: SQLiteHelper,
  offset: number = 0,
  limit: number = 200
): Promise<ImageEntity[]> {
  const result = await db.all(`SELECT
    id, path, createdAt FROM ${ImageEntityTableName} LIMIT ? OFFSET ?`, limit, offset);
  return result.map(({ id, path, createdAt }) => {
    return {
      id,
      path,
      createdAt: new Date(createdAt),
    };
  });
}

export async function queryImageById(db: SQLiteHelper, imageId: number) {
  const result = await db.get(`SELECT
    id, path, createdAt FROM ${ImageEntityTableName} WHERE id=?`,
    imageId
  );
  const { createdAt, ...rest } = result;
  return {
    ...rest,
    createdAt: new Date(createdAt),
  };
}

export async function insertImageEntity(db: SQLiteHelper, entity: ImageEntity): Promise<number> {
  const stmt = await db.prepare(`INSERT INTO ${ImageEntityTableName} (path, createdAt) VALUES (?, ?)`);
  await stmt.run(entity.path, entity.createdAt);
  const { id } = await db.get(`SELECT id FROM ${ImageEntityTableName} WHERE path=?`, entity.path);
  await stmt.finalize();
  return id;
}

export async function insertThumbnailEntity(db: SQLiteHelper, thumbnail: ThumbnailEntity) {
  const { path, type, imageId, width, height, createAt } = thumbnail;
  const stmt = await db.prepare(`
    INSERT INTO ${ThumbnailsTableName} (path, type, imageId, width, height, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  await stmt.run(path, type, imageId, width, height, createAt);
  await stmt.finalize();
}

export async function queryThumbnailsByImageId(db: SQLiteHelper, imageId: number): Promise<ThumbnailEntity[]> {
  const result = await db.all(`SELECT
    path, type, width, height, createdAt
    FROM ${ThumbnailsTableName} WHERE imageId=?`, imageId);
  return result.map(({ createdAt, ...rst }) => {
    return {
      ...rst,
      createdAt: new Date(createdAt),
    };
  });
}

export async function deleteImageById(db: SQLiteHelper, imageId: number) {
  await db.run(`DELETE FROM ${ImageEntityTableName} WHERE id=?`, imageId);
  await db.run(`DELETE FROM ${ThumbnailsTableName} WHERE imageId=?`, imageId);
}
