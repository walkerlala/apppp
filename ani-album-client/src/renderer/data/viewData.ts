import { observable } from 'mobx';

export interface ImageViewerData {
  imageId: number,
  thumbnailPath: string,
}

export class ViewData {

  @observable
  scaleToFit: boolean = true;

  @observable
  imageViewerData: ImageViewerData | null = null;

}

const viewDataStore = new ViewData();

export default viewDataStore;
