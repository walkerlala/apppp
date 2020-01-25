import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import { ImageWithThumbnails } from 'common/image';
import ImageItem from './ImageItem';
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
    ipcRenderer.addListener(ClientMessageType.PhotoDeleted, this.handlePhotoDeleted);
    window.addEventListener('contextmenu', this.handleContextMenu);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(ClientMessageType.PhotoImported, this.handlePhotoImported);
    ipcRenderer.removeListener(ClientMessageType.PhotoDeleted, this.handlePhotoDeleted);
    window.removeEventListener('contextmenu', this.handleContextMenu);
  }

  private handlePhotoImported = () => {
    this.fetchInitialImages();
  }

  private handlePhotoDeleted = (event: any, imageId: number) => {
    console.log('deleted', imageId);
    const { images } = this.state;
    this.setState({
      images: images.filter(item => item.id !== Number(imageId)),
    });
  }

  private handleContextMenu = async (evt: Event) => {
    let current = evt.target as HTMLElement;
    while (true) {
      if (current == null) return;
      if (current == document.body) return;

      if (current.classList.contains('ani-grid-item') && current.hasAttribute('data-id')) {
        const dataId = Number(current.getAttribute('data-id'));
        ipcRenderer.invoke(ClientMessageType.ShowContextMenu, {
          imageId: dataId,
        });
        return;
      }

      current = current.parentElement;
    }
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

  private renderImages() {
    const { images } = this.state;
    return images.map(data => {
      return (
        <ImageItem key={`item-${data.id}`} data={data} />
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
