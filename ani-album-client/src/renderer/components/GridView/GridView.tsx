import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import { ImageWithThumbnails } from 'common/image';
import { ContextMenuType } from 'common/menu';
import { eventBus, RendererEvents } from 'renderer/events';
import ImageItem from './ImageItem';
import GridViewLayout from './GridViewLayout';

interface GridViewProps {
  selectedIds: Set<number>;
  scaleToFit?: boolean,
  onImageDoubleClicked?: (imageId: number, thumbnailPath: string) => void;
  onSelectedIdsChanged?: (ids: Set<number>) => void;
}

interface GridViewState {
  offset: number;
  length: number;
  images: ImageWithThumbnails[];
}

class GridView extends Component<GridViewProps, GridViewState> {

  static defaultProps: Partial<GridViewProps> = {
    scaleToFit: true,
  }

  constructor(props: GridViewProps) {
    super(props);
    this.state = {
      offset: 0,
      length: 200,
      images: [],
    };
  }

  componentDidMount() {
    ipcRenderer.addListener(ClientMessageType.PhotoImported, this.handlePhotoImported);
    ipcRenderer.addListener(ClientMessageType.PhotoDeleted, this.handlePhotoDeleted);
    window.addEventListener('contextmenu', this.handleContextMenu);
    eventBus.addListener(RendererEvents.PhotoItemClicked, this.handlePhotoItemClicked);

    this.fetchInitialImages();
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(ClientMessageType.PhotoImported, this.handlePhotoImported);
    ipcRenderer.removeListener(ClientMessageType.PhotoDeleted, this.handlePhotoDeleted);
    window.removeEventListener('contextmenu', this.handleContextMenu);
    eventBus.removeListener(RendererEvents.PhotoItemClicked, this.handlePhotoItemClicked);
  }

  private handlePhotoItemClicked = (imageId: number) => {
    if (!this.props.onSelectedIdsChanged) {
      return;
    }
    const newSet: Set<number> = new Set();
    newSet.add(imageId);
    this.props.onSelectedIdsChanged(newSet);
  }

  private handlePhotoImported = () => {
    this.fetchInitialImages();
  }

  private handlePhotoDeleted = (event: any, imageId: number) => {
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
        ipcRenderer.invoke(ClientMessageType.ShowContextMenu, ContextMenuType.ImageItem, {
          imageId: dataId,
        });
        if (!this.props.onSelectedIdsChanged) {
          return;
        }
        // const newSet = produce(this.props.selectedIds, (draft: Set<number>) => {
        //   draft.clear();
        //   draft.add(dataId);
        // });
        const newSet: Set<number> = new Set();
        newSet.add(dataId);
        this.props.onSelectedIdsChanged(newSet);
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
    const { onImageDoubleClicked, scaleToFit, selectedIds } = this.props;
    const { images } = this.state;
    return images.map(data => {
      return (
        <ImageItem
          key={`item-${data.id}`}
          data={data}
          isSelected={selectedIds.has(data.id)}
          scaleToFit={scaleToFit}
          onImageDoubleClicked={onImageDoubleClicked}
        />
      );
    });
  }

  render() {
    return (
      <GridViewLayout>
        {this.renderImages()}
      </GridViewLayout>
    );
  }
  
}

export default GridView;
