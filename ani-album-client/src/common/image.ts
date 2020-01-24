
export interface ImageEntity {
  id?: number;
  path: string;
  createdAt: Date;
}

export interface ThumbnailEntity {
  path: string;
  type: number;
  imageId: number;
  width: number;
  height: number;
  createAt: Date;
}

export type ImageWithThumbnails = ImageEntity & {
  thumbnails: ThumbnailEntity[];
}
