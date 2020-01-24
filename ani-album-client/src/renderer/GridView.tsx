import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { ThumbnailType } from 'protos/ipc_pb';
import { ClientMessageType } from 'common/message';
import { ImageWithThumbnails } from 'common/image';
import './GridView.scss';

interface GridViewState {
  offset: number;
  length: number;
  images: ImageWithThumbnails[];
}

class GridView extends Component<{}, GridViewState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      offset: 0,
      length: 200,
      images: [],
    };
  }

  componentDidMount() {
    this.fetchInitialImages();
    ipcRenderer.addListener(ClientMessageType.PhotoImported, this.handlePhotoImported);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(ClientMessageType.PhotoImported, this.handlePhotoImported);
  }

  handlePhotoImported = () => {
    this.fetchInitialImages();
  }

  async fetchInitialImages() {
    try {
      const { content } = await ipcRenderer.invoke(ClientMessageType.GetAllImages, {
        offset: 0,
        length: 200,
      });
      this.setState({
        images: content,
      });
    } catch(err) {
      console.error(err);
    }
  }

  private getMediumThumbnail(image: ImageWithThumbnails): string {
    const { thumbnails, path } = image;
    if (typeof thumbnails === 'undefined' || thumbnails.length == 0) {
      return path;
    }

    for (const item of thumbnails) {
      if (item.type == ThumbnailType.MEDIUM) {
        return item.path;
      }
    }

    return path;
  }

  private renderImages() {
    const { images } = this.state;
    return images.map(data => {
      const thumbnailPath = this.getMediumThumbnail(data);
      return (
        <div key={`item-${data.id}`} className="ani-grid-item">
          <img src={`file://${thumbnailPath}`} />
        </div>
      );
    })
  }

  render() {
    return (
      <div className="ani-grid-view">
        <div className="ani-grid-content-container">
          {this.renderImages()}
        </div>
      </div>
    );
  }
  
}

export default GridView;
