/**
 * Data Access Layer
 */
import { ImageEntity, ThumbnailEntity } from 'common/image';
import { Album } from 'common/album';
import { Workspace } from 'common/workspace';
import { logger } from './logger';
import { SQLiteHelper } from './sqliteHelper';
import { once, isUndefined } from 'lodash';

const GlobalKvTableName = 'globalKv';
const ImageEntityTableName = 'imagesEntity';
const ThumbnailsTableName = 'thumbnails';
const AlbumsTableName = 'albums';
const WorkspacesTableName = 'workspaces';
const ImageToAlbumTableName = 'imageToAlbum';
const ImageToWorkspaceTableName = 'imageToWorkspace';

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

    if (dbVersion === 2) {
      await upgradeToVersion3(db);
      dbVersion = 3;
    }

    if (dbVersion === 3) {
      await upgradeToVersion4(db);
      dbVersion = 4;
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

async function upgradeToVersion3(db: SQLiteHelper) {
  logger.info('upgrade database to version 3');
  await db.run(`
    CREATE TABLE IF NOT EXISTS ${WorkspacesTableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parentId INTEGER NOT NULL DEFAULT 0,
      name TEXT NOT NULL,
      createdAt DATETIME NOT NULL
    )
  `);
  await db.run(`INSERT OR REPLACE INTO ${GlobalKvTableName} (key, value) VALUES ("version", "3")`);
}

async function upgradeToVersion4(db: SQLiteHelper) {
  logger.info('upgrade database to version 4');
  await db.run(`
    CREATE TABLE IF NOT EXISTS ${ImageToAlbumTableName} (
      imageId INTEGER NOT NULL,
      albumId INTEGER NOT NULL,
      createdAt DATETIME NOT NULL,
      PRIMARY KEY (imageId, albumId)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS ${ImageToWorkspaceTableName} (
      imageId INTEGER NOT NULL,
      workspaceId INTEGER NOT NULL,
      createdAt DATETIME NOT NULL,
      PRIMARY KEY (imageId, workspaceId)
    )
  `);

  await db.run(`INSERT OR REPLACE INTO ${GlobalKvTableName} (key, value) VALUES ("version", "4")`);
}

export async function insertWorkspace(db: SQLiteHelper, workspace: Workspace) {
  const stmt = await db.prepare(`
    INSERT INTO ${WorkspacesTableName}
    (parentId, name, createdAt) VALUES (?, ?, ?)
  `);
  const { parentId, name, createdAt } = workspace;
  await stmt.run(parentId, name, createdAt);
  await stmt.finalize();
  const { id } = await db.get(`SELECT id FROM ${WorkspacesTableName} WHERE name=? AND createdAt=?`, name, createdAt);
  return id;
}

export async function queryWorkspacesByParentId(db: SQLiteHelper, parentId: number) {
  const result = await db.all(`
    SELECT id, parentId, name, createdAt FROM ${WorkspacesTableName}
    WHERE parentId=? ORDER BY createdAt DESC
  `, parentId);
  return result.map(({ createdAt, ...rest }) => ({
    createdAt: new Date(createdAt),
    ...rest,
  }));
}

export async function addImageToAlbum(db: SQLiteHelper, imageId: number, albumId: number) {
  await db.run(`
    INSERT OR REPLACE INTO ${ImageToAlbumTableName} (imageId, albumId, createdAt)
    VALUES (?, ?, ?)
  `, imageId, albumId, new Date());
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

export async function queryAlbumById(db: SQLiteHelper, id: number): Promise<Album | undefined> {
  const result = await db.get(`
    SELECT id, name, description, createdAt FROM ${AlbumsTableName}
    WHERE id=?
  `, id);
  if (isUndefined(result)) {
    return undefined;
  }
  const { createdAt, ...rest } = result;
  return {
    ...rest,
    createdAt: new Date(createdAt),
  };
}

export async function updateAlbumById(db: SQLiteHelper, album: Album): Promise<void> {
  if (isUndefined(album.id)) {
    return;
  }
  await db.run(`UPDATE ${AlbumsTableName} SET name=?, description=? WHERE id=?`,
    album.name, album.description, album.id,
  );
}

export async function queryWorkspaceById(db: SQLiteHelper, id: number): Promise<Workspace | undefined> {
  const result = await db.get(`
    SELECT id, parentId, name, createdAt FROM ${WorkspacesTableName}
    WHERE id=?
  `, id);
  if (isUndefined(result)) {
    return undefined;
  }
  const { createdAt, ...rest } = result;
  return {
    ...rest,
    createdAt: new Date(createdAt),
  };
}

export async function addImageToWorkspace(db: SQLiteHelper, imageId: number, workspaceId: number) {
  await db.run(`
    INSERT OR REPLACE INTO ${ImageToWorkspaceTableName} (imageId, workspaceId, createdAt)
    VALUES (?, ?, ?)
  `, imageId, workspaceId, new Date());
}

export async function updateWorkspaceById(db: SQLiteHelper, wp: Workspace): Promise<void> {
  const { id, name, parentId } = wp;
  if (isUndefined(id)) {
    return;
  }
  await db.run(`UPDATE ${WorkspacesTableName} SET name=?, parentId=? WHERE id=?`,
    name, parentId, id,
  );
}

function imagesResultToInterface(result: any[]) {
  return result.map(({ id, path, createdAt }) => {
    return {
      id,
      path,
      createdAt: new Date(createdAt),
    };
  });
}

export async function queryImageEntities(
  db: SQLiteHelper,
  offset: number = 0,
  limit: number = 200
): Promise<ImageEntity[]> {
  const result = await db.all(`SELECT
    id, path, createdAt FROM ${ImageEntityTableName} LIMIT ? OFFSET ?`, limit, offset);
  return imagesResultToInterface(result);
}

export async function queryImageById(db: SQLiteHelper, imageId: number) {
  const result = await db.get(
    `SELECT id, path, createdAt FROM ${ImageEntityTableName} WHERE id=?`,
    imageId,
  );
  if (isUndefined(result)) {
    return undefined;
  }
  const { createdAt, ...rest } = result;
  return {
    ...rest,
    createdAt: new Date(createdAt),
  };
}

export async function queryImagesByAlbumId(db: SQLiteHelper, albumId: number) {
  const result = await db.all(
    `SELECT
      imagesEntity.id, imagesEntity.path, imagesEntity.createdAt
    FROM imagesEntity, imageToAlbum 
    WHERE imagesEntity.id = imageToAlbum.imageId AND albumId = ?`,
    albumId,
  );
  return imagesResultToInterface(result);
}

export async function queryImagesByWorkspaceId(db: SQLiteHelper, workspaceId: number) {
  const result = await db.all(
    `SELECT
      imagesEntity.id, imagesEntity.path, imagesEntity.createdAt
    FROM imagesEntity, imageToWorkspace 
    WHERE imagesEntity.id = imageToWorkspace.imageId AND workspaceId = ?`,
    workspaceId,
  );
  return imagesResultToInterface(result);
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
