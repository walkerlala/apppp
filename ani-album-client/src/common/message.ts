
export enum ClientMessageType {
  GetAllImages = 'GetAllImages',
  PhotoImported = 'PhotoImported',
  ShowContextMenu = 'ShowContextMenu',
  PhotoDeleted = 'PhotoDeleted',
  GetImageById = 'GetImageById',
  ToggleFullscreen = 'ToggleFullscreen',
  ToggleWindowActive = 'ToggleWindowActive',
  CreateAlbum = 'CreateAlbum',
  GetAllAlbums = 'GetAllAlbums',
  GetAlbumById = 'GetAlbumById',
  UpdateAlbumById = 'UpdateAlbumById',
  CreateWorkspace = 'CreateWorkspace',
  GetWorkspaceById = 'GetWorkspaceById',
  UpdateWorkspaceById = 'UpdateWorkspaceById',
  GetWorkspacesByParentId = 'GetWorkspacesByParentId',
  AddImageToAlbum = 'AddImageToAlbum',
  AddImageToWorkspace = 'AddImageToWorkspace',
  GetImagesByAlbumId = 'GetImagesByAlbumId',
  AddImagesToCurrentAlbum = 'AddImagesToCurrentAlbum',
  GetImagesByWorkspaceId = 'GetImagesByWorkspaceId',
  WorkspaceDeleted = 'WorkspaceDeleted',
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
