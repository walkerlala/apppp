
export enum ClientMessageType {
  GetAllImages = 'GetAllImages',
  PhotoImported = 'PhotoImported',
  ShowContextMenu = 'ShowContextMenu',
  PhotoDeleted = 'PhotoDeleted',
  GetImageById = 'GetImageById',
  ToggleFullscreen = 'ToggleFullscreen'
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
