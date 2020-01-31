
export enum PageKey {
  Root = '__Root',
  MyPhotos = 'MyPhotos',
  Albums = 'Albums',
  Workspaces = 'Wp-0',
  Search = 'Search',
}

export const AlbumPrefix = 'Album-';
export const WorkspacePrefix = 'Wp-';

export function isAAlbum(key: string) {
  return key.startsWith(AlbumPrefix);
}

export function getAlbumToken(key: string) {
  return key.slice(AlbumPrefix.length);
}

export function isAWorkspace(key: string) {
  return key.startsWith(WorkspacePrefix);
}

export function getWorkspaceToken(key: string) {
  return key.slice(WorkspacePrefix.length);
}
