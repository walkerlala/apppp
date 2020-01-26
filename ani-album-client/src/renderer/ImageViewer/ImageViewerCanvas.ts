import { ImageWithThumbnails } from 'common/image';
import { IDisposable } from 'common/disposable';
import { ClientMessageType } from 'common/message';
import { removeElement, turnInvisible, turnVisible, Size, setImageSize } from 'renderer/utils';
import { ipcRenderer } from 'electron';

/**
 * Thumbnail could be loaded very fast, but the source image couldn't.
 * Show thumbnail at the beginning.
 */
export class ImageViewerCanvas implements IDisposable {

  private thumbnailElement: HTMLImageElement | null;
  private sourceElement: HTMLImageElement;
  private imageData: ImageWithThumbnails | null = null;
  private imageSize: Size;
  private isFilled: boolean = true;

  constructor(
    public readonly container: HTMLDivElement,
    public readonly imageId: number,
    public readonly thumbnailPath: string
  ) {
    this.imageSize = {
      width: 0,
      height: 0,
    };

    this.thumbnailElement = document.createElement('img');
    this.thumbnailElement.src = thumbnailPath;
    this.thumbnailElement.addEventListener('load', this.handleThumbnailImageLoaded);
    this.setImageDefaultStyle(this.thumbnailElement);
    turnInvisible(this.thumbnailElement);

    this.sourceElement = document.createElement('img');
    this.sourceElement.addEventListener('load', this.handleSourceImageLoaded);
    this.setImageDefaultStyle(this.sourceElement);
    turnInvisible(this.sourceElement);

    container.appendChild(this.thumbnailElement);
    container.appendChild(this.sourceElement);

    window.addEventListener('wheel', this.handleWheel);

    this.fetchDataAndSetSrc(imageId);
  }
  
  private handleWheel = (e: WheelEvent) => {
    console.log(e);
  }

  private setImageDefaultStyle(element: HTMLElement) {
    element.style.left = '50%';
    element.style.top = '50%';
  }

  private async fetchDataAndSetSrc(imageId: number) {
    this.imageData = await ipcRenderer.invoke(ClientMessageType.GetImageById, imageId);
    this.sourceElement.src = this.imageData.path;
  }

  private handleThumbnailImageLoaded = () => {
    const { width, height } = this.thumbnailElement;
    const { innerWidth, innerHeight } = window;

    const isWide = width >= height;

    if (isWide) {
      const expectedWidth = innerWidth;
      const expectedHeight = innerWidth * (height / width);
      this.imageSize = {
        width: expectedWidth,
        height: expectedHeight,
      };
    } else {
      const expectedHeight = innerHeight;
      const expectedWidth = innerHeight * (width / height);
      this.imageSize = {
        width: expectedWidth,
        height: expectedHeight,
      };
    }

    setImageSize(this.thumbnailElement, this.imageSize);
    turnVisible(this.thumbnailElement);
  }

  private handleSourceImageLoaded = () => {
    setImageSize(this.sourceElement, this.imageSize);
    turnVisible(this.sourceElement);

    removeElement(this.thumbnailElement);
    this.thumbnailElement = null;
  }

  dispose() {
    if (this.thumbnailElement !== null) {
      removeElement(this.thumbnailElement);
    }
    removeElement(this.sourceElement);

    window.removeEventListener('wheel', this.handleWheel);
  }

}
