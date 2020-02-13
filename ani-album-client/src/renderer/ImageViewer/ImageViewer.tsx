import React, { Component } from 'react';
import { observe, IReactionDisposer, IValueDidChange, action } from 'mobx';
import { viewDataStore } from 'renderer/data';
import { ImageViewerCanvas } from './ImageViewerCanvas';
import CloseButton from './CloseButton';
import './ImageViewer.scss';
import { ImageViewerData } from 'renderer/data/viewData';

interface ImageViewerState {
  enable: boolean;
}

class ImageViewer extends Component<{}, ImageViewerState> {

  private __observeDisposer: IReactionDisposer | null = null;
  private __imageViewerCanvas: ImageViewerCanvas | null = null;
  private __imgContainerRef: React.RefObject<HTMLDivElement>;

  constructor(props: {}) {
    super(props);
    this.state = {
      enable: false,
    };
    this.__imgContainerRef = React.createRef();
  }

  componentDidMount() {
    // eventBus.addListener(RendererEvents.PhotoItemDoubleClicked, this.handleImageItemDoubleClicked);
    observe<'imageViewerData', ImageViewerData>(viewDataStore as any, 'imageViewerData', this.handleViewDataChanged);
  }

  componentWillUnmount() {
    // eventBus.removeListener(RendererEvents.PhotoItemDoubleClicked, this.handleImageItemDoubleClicked);

    if (this.__observeDisposer) {
      this.__observeDisposer();
    }

    if (this.__imageViewerCanvas) {
      this.__imageViewerCanvas.dispose();
    }
  }

  private handleViewDataChanged = (change: IValueDidChange<ImageViewerData>) => {
    if (change.newValue === null) {
      this.setState({
        enable: false,
      });
      this.setViewerCanvas(null);
      return;
    }

    this.setState({
      enable: true,
    }, () => {
      const { imageId, thumbnailPath } = change.newValue;

      const viewer = new ImageViewerCanvas(
        this.__imgContainerRef.current,
        imageId,
        thumbnailPath,
      );
      this.setViewerCanvas(viewer);
    });
  }

  private setViewerCanvas(canvas: ImageViewerCanvas | null) {
    if (this.__imageViewerCanvas) {
      this.__imageViewerCanvas.dispose();
    }
    this.__imageViewerCanvas = canvas;
  }

  private handleImageItemDoubleClicked = (imageId: number, thumbnailPath: string) => {
    this.setState({
      enable: true,
    }, () => {
      const viewer = new ImageViewerCanvas(
        this.__imgContainerRef.current,
        imageId,
        thumbnailPath,
      );
      this.setViewerCanvas(viewer);
    });
  }

  @action
  private handleCloseButtonClicked = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    viewDataStore.imageViewerData = null;
  }

  // private getStylesOfImg(): React.CSSProperties {
  //   const { shouldDisplayImage } = this;
  //   let computedSize: React.CSSProperties | undefined;
  //   if (shouldDisplayImage) {
  //     const { width, height } = this.computeSize();
  //     computedSize = {
  //       width: `${width}px`,
  //       height: `${height}px`,
  //     };
  //   }
  //   return {
  //     visibility: shouldDisplayImage ? 'visible' : 'hidden',
  //     left: '50%',
  //     top: '50%',
  //     ...computedSize,
  //   };
  // }

  render() {
    const { enable } = this.state;
    if (!enable) return null;
    return (
      <div className="ani-image-viewer">
        <CloseButton onClick={this.handleCloseButtonClicked} />
        <div className="ani-image-viewer-content" ref={this.__imgContainerRef}>
        </div>
      </div>
    );
  }

}

export default ImageViewer;
