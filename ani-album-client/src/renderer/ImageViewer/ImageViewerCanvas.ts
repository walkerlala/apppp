import { ImageWithThumbnails } from 'common/image';
import { IDisposable } from 'common/disposable';
import { ClientMessageType } from 'common/message';
import {
  removeElement, turnInvisible, turnVisible,
  setImageSize, setImagePosition,
} from 'renderer/utils';
import NDArray from 'vectorious/index';
import { ipcRenderer } from 'electron';

/**
 * Thumbnail could be loaded very fast, but the source image couldn't.
 * Show thumbnail at the beginning.
 */
export class ImageViewerCanvas implements IDisposable {

  private thumbnailElement: HTMLImageElement | null;
  private sourceElement: HTMLImageElement;
  private imageData: ImageWithThumbnails | null = null;
  private imageSize: NDArray;
  private __scale: number = 1.0;

  constructor(
    public readonly container: HTMLDivElement,
    public readonly imageId: number,
    public readonly thumbnailPath: string
  ) {
    this.imageSize = NDArray.array([ 0, 0 ]);

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
    window.addEventListener('resize', this.handleWindowResize);

    this.fetchDataAndSetSrc(imageId);
  }
  
  private handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey) { // zooming
      this.scale = this.scale + e.deltaY * -0.1;
    }
  }

  private handleWindowResize = (e: UIEvent) => {

  }

  get scale() {
    return this.__scale;
  }

  set scale(value: number) {
    if (value <= 1) {
      this.__scale = 1;
    } else {
      this.__scale = value;
    }
    console.log()

    const elm = this.getAImageElement();
    const properSize = this.getFixedSize(NDArray.array([
      elm.width,
      elm.height,
    ]));

    this.imageSize = properSize.scale(this.__scale);

    setImageSize(elm, this.imageSize);
  }

  get isFilled() {
    return this.__scale === 1;
  }

  private getAImageElement(): HTMLImageElement {
    if (this.thumbnailElement !== null) {
      return this.thumbnailElement;
    }
    return this.sourceElement;
  }

  private setImageDefaultStyle(element: HTMLElement) {
    const { innerWidth, innerHeight } = window;

    const pos = NDArray.array([ innerWidth, innerHeight ]).scale(0.5).subtract(this.imageSize.scale(0.5));

    setImagePosition(element, pos);
  }

  private async fetchDataAndSetSrc(imageId: number) {
    this.imageData = await ipcRenderer.invoke(ClientMessageType.GetImageById, imageId);
    this.sourceElement.src = this.imageData.path;
  }

  private getFixedSize(imageSize: NDArray): NDArray {
    const width = imageSize.get(0);
    const height = imageSize.get(1);
    const { innerWidth, innerHeight } = window;

    const isWide = width >= height;

    if (isWide) {
      const expectedWidth = innerWidth;
      const expectedHeight = innerWidth * (height / width);
      return NDArray.array([
        expectedWidth,
        expectedHeight,
      ]);
    } else {
      const expectedHeight = innerHeight;
      const expectedWidth = innerHeight * (width / height);
      return NDArray.array([
        expectedWidth,
        expectedHeight,
      ]);
    }
  }

  private handleThumbnailImageLoaded = () => {
    const { width, height } = this.thumbnailElement;

    this.imageSize = this.getFixedSize(NDArray.array([ width, height ]));

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
    window.removeEventListener('resize', this.handleWindowResize);
  }

}
