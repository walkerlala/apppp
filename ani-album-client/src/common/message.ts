
export enum ClientMessageType {
  GetAllImages = 'GetAllImages',
  PhotoImported = 'PhotoImported',
  ShowContextMenu = 'ShowContextMenu',
  PhotoDeleted = 'PhotoDeleted',
  GetImageById = 'GetImageById',
  ToggleFullscreen = 'ToggleFullscreen',
  CreateAlbum = 'CreateAlbum',
  GetAllAlbums = 'GetAllAlbums',
  GetAlbumById = 'GetAlbumById',
  UpdateAlbumById = 'UpdateAlbumById',
  CreateWorkspace = 'CreateWorkspace',
  GetWorkspacesByParentId = 'GetWorkspacesByParentId',
  AddImageToAlbum = 'AddImageToAlbum',
  AddImageToWorkspace = 'AddImageToWorkspace',
  GetImagesByAlbumId = 'GetImagesByAlbumId',
}

export interface MessageRequest {
  offset: number;
  length: number;
}

export interface ImageItem {
  id: number;
  path: string;
}

export interface MessageResponse {
  content: ImageItem[];
}
