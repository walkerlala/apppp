import { ImageWithThumbnails } from 'common/image';
import { IDisposable } from 'common/disposable';
import { ClientMessageType } from 'common/message';
import { removeElement, turnInvisible, turnVisible, setImageSize } from 'renderer/utils';
import { Vector, vec } from '@josh-brown/vector';
import { ipcRenderer } from 'electron';

/**
 * Thumbnail could be loaded very fast, but the source image couldn't.
 * Show thumbnail at the beginning.
 */
export class ImageViewerCanvas implements IDisposable {

  private thumbnailElement: HTMLImageElement | null;
  private sourceElement: HTMLImageElement;
  private imageData: ImageWithThumbnails | null = null;
  private imageSize: Vector<number>;
  private __scale: number = 1.0;

  constructor(
    public readonly container: HTMLDivElement,
    public readonly imageId: number,
    public readonly thumbnailPath: string
  ) {
    this.imageSize = vec([ 0, 0 ]);

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
    if (e.ctrlKey) { // zooming
      this.scale = this.scale + e.deltaY * -0.1;
    }
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
    const properSize = this.getFixedSize(vec([
      elm.width,
      elm.height,
    ]));

    this.imageSize = properSize.scalarMultiply(this.__scale);

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
    element.style.left = '50%';
    element.style.top = '50%';
  }

  private async fetchDataAndSetSrc(imageId: number) {
    this.imageData = await ipcRenderer.invoke(ClientMessageType.GetImageById, imageId);
    this.sourceElement.src = this.imageData.path;
  }

  private getFixedSize(imageSize: Vector<number>): Vector<number> {
    const width = imageSize.getEntry(0);
    const height = imageSize.getEntry(1);
    const { innerWidth, innerHeight } = window;

    const isWide = width >= height;

    if (isWide) {
      const expectedWidth = innerWidth;
      const expectedHeight = innerWidth * (height / width);
      return vec([
        expectedWidth,
        expectedHeight,
      ]);
    } else {
      const expectedHeight = innerHeight;
      const expectedWidth = innerHeight * (width / height);
      return vec([
        expectedWidth,
        expectedHeight,
      ]);
    }
  }

  private handleThumbnailImageLoaded = () => {
    const { width, height } = this.thumbnailElement;

    this.imageSize = this.getFixedSize(vec([ width, height ]));

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
