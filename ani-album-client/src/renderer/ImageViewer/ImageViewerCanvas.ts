import { ImageWithThumbnails } from 'common/image';
import { IDisposable } from 'common/disposable';
import { ClientMessageType } from 'common/message';
import { removeElement } from 'renderer/utils';
import { Vector, vec } from '@josh-brown/vector';
import { ipcRenderer } from 'electron';

/**
 * Thumbnail could be loaded very fast, but the source image couldn't.
 * Show thumbnail at the beginning.
 */
export class ImageViewerCanvas implements IDisposable {

  private canvas: HTMLCanvasElement;
  private canvasCtx: CanvasRenderingContext2D = null;
  private thumbnailElement: HTMLImageElement | null;
  private sourceElement: HTMLImageElement;
  private imageData: ImageWithThumbnails | null = null;
  private imageSize: Vector<number>;
  private __scale: number = 1.0;
  private __dpr: number = 1;

  constructor(
    public readonly container: HTMLDivElement,
    public readonly imageId: number,
    public readonly thumbnailPath: string
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('ani-image-viewer-canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    container.appendChild(this.canvas);

    this.imageSize = vec([ 0, 0 ]);

    this.thumbnailElement = new Image();
    this.thumbnailElement.src = thumbnailPath;
    this.thumbnailElement.addEventListener('load', this.handleThumbnailImageLoaded);

    this.sourceElement = new Image();
    this.sourceElement.addEventListener('load', this.handleSourceImageLoaded);

    window.addEventListener('wheel', this.handleWheel);
    window.addEventListener('resize', this.handleWindowResize);

    this.fetchDataAndSetSrc(imageId);

    this.setupCanvas();
  }

  private setupCanvas() {
    this.__dpr = window.devicePixelRatio || 1;
    // Get the size of the canvas in CSS pixels.
    const rect = this.canvas.getBoundingClientRect();
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    this.canvas.width = rect.width * this.__dpr;
    this.canvas.height = rect.height * this.__dpr;

    const ctx = this.canvas.getContext('2d');
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(this.__dpr, this.__dpr);
    this.canvasCtx = ctx;
    return this.canvasCtx;
  }

  private drawOnCanvas() {
    let img: HTMLImageElement;
    if (this.thumbnailElement !== null) {
      img = this.thumbnailElement;
    } else {
      img = this.sourceElement;
    }

    const rect = this.canvas.getBoundingClientRect();
    const { width: rectWidth, height: rectHeight } = rect;
    const { width, height } = img;

    const canvasRatio = rectWidth / rectHeight;
    const imgRatio = width / height;

    let x: number = 0;
    let y: number = 0;
    let drawWidth: number = 0;
    let drawHeight: number = 0;
    if (imgRatio >= canvasRatio) {
      drawWidth = rectWidth;
      drawHeight = Math.floor(rectWidth / imgRatio);
      y = Math.floor((rectHeight - drawHeight) / 2);
    } else {
      drawHeight = rectHeight;
      drawWidth = Math.floor(rectHeight * imgRatio);
      x = Math.floor((rectWidth - drawWidth) / 2);
    }
    
    this.canvasCtx.drawImage(img, x, y, drawWidth, drawHeight);
  }

  private handleWindowResize = (e: UIEvent) => {
    this.setupCanvas();
    this.drawOnCanvas();
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

    // setImageSize(elm, this.imageSize);
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
    // const { width, height } = this.thumbnailElement;

    // this.imageSize = this.getFixedSize(vec([ width, height ]));

    // setImageSize(this.thumbnailElement, this.imageSize);
    // turnVisible(this.thumbnailElement);

    // this.setupCanvas();
    this.drawOnCanvas();
  }

  private handleSourceImageLoaded = () => {
    // setImageSize(this.sourceElement, this.imageSize);
    // turnVisible(this.sourceElement);

    // removeElement(this.thumbnailElement);
    this.thumbnailElement = null;

    this.drawOnCanvas();
  }

  dispose() {
    // if (this.thumbnailElement !== null) {
    //   removeElement(this.thumbnailElement);
    // }
    // removeElement(this.sourceElement);
    removeElement(this.canvas);

    window.removeEventListener('wheel', this.handleWheel);
  }

}
