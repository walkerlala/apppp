
export enum ClientMessageType {
  GetAllImages = 'GetAllImages',
  PhotoImported = 'PhotoImported',
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
