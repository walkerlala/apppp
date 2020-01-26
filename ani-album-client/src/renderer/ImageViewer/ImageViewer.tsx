import React, { Component } from 'react';
import { ClientMessageType } from 'common/message';
import { ImageWithThumbnails } from 'common/image';
import { ipcRenderer } from 'electron';
import { eventBus, RendererEvents } from 'renderer/events';
import CloseButton from './CloseButton';
import './ImageViewer.scss';

interface ImageViewerState {
  enable: boolean;
  data: ImageWithThumbnails | null,
}

class ImageViewer extends Component<{}, ImageViewerState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      enable: false,
      data: null,
    };
  }

  componentDidMount() {
    eventBus.addListener(RendererEvents.PhotoItemDoubleClicked, this.handleImageItemDoubleClicked);
  }

  componentWillUnmount() {
    eventBus.removeListener(RendererEvents.PhotoItemDoubleClicked, this.handleImageItemDoubleClicked);
  }

  private handleImageItemDoubleClicked = (imageId: number) => {
    this.setState({ // 立即显示
      enable: true,
    });
    this.fetchDataAndSetPath(imageId);
  }

  private async fetchDataAndSetPath(imageId: number) {
    const image = await ipcRenderer.invoke(ClientMessageType.GetImageById, imageId);
    this.setState({
      data: image,
    });
  }

  private handleCloseButtonClicked = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    this.setState({
      enable: false,
      data: null,
    });
  }

  renderImageContent() {
    const { data } = this.state;
    if (data === null) return null;

    return (
      <div className="ani-image-viewer-content">
        <img src={`file://${data.path}`} alt="" />
      </div>
    );
  }

  render() {
    const { enable } = this.state;
    if (!enable) return null;
    return (
      <div className="ani-image-viewer">
        <CloseButton onClick={this.handleCloseButtonClicked} />
        {this.renderImageContent()}
      </div>
    );
  }

}

export default ImageViewer;
