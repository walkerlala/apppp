import * as React from 'react';
import { MainContentContainer } from 'renderer/styles';
import ImportButton from 'renderer/components/ImportButton';
import { eventBus, RendererEvents } from 'renderer/events';
import { ModalTypes } from 'renderer/Modals';
import { ImageWithThumbnails } from 'common/image';
import { ClientMessageType } from 'common/message';
import { ipcRenderer } from 'electron';
import { getAlbumToken, isAAlbum } from 'renderer/pageKey';
import GridViewLayout from 'renderer/components/GridView/GridViewLayout';
import GridViewImageItem from 'renderer/components/GridView/ImageItem';
import { GridViewContainer } from './styles';
import { ContextMenuType } from 'common/menu';

export interface AlbumContentPageProps {
  pageKey: string;
}

interface State {
  images: ImageWithThumbnails[];
}

class AlbumContentPage extends React.Component<AlbumContentPageProps, State> {

  private __containerRef: React.RefObject<HTMLDivElement> = React.createRef();

  constructor(props: AlbumContentPageProps) {
    super(props);
    this.state = {
      images: [],
    };
  }

  componentDidMount() {
    eventBus.addListener(RendererEvents.NavigatePage, this.handlePageNavigation);
    eventBus.addListener(RendererEvents.AlbumContentUpdated, this.handleAlbumContentChanged);
    ipcRenderer.addListener(ClientMessageType.AddImagesToCurrentAlbum, this.handleAddImagesToCurrentAlbum);

    const albumId = Number(getAlbumToken(this.props.pageKey));
    this.fetchImagesByAlbumId(albumId);
  }

  componentWillUnmount() {
    eventBus.removeListener(RendererEvents.NavigatePage, this.handlePageNavigation);
    eventBus.removeListener(RendererEvents.AlbumContentUpdated, this.handleAlbumContentChanged);
    ipcRenderer.removeListener(ClientMessageType.AddImagesToCurrentAlbum, this.handleAddImagesToCurrentAlbum);
  }

  private handleAddImagesToCurrentAlbum = () => {
    const { pageKey } = this.props;
    eventBus.emit(RendererEvents.ShowModal, ModalTypes.ImportPhotosToAlbum, pageKey);
  }

  private handleAlbumContentChanged = (albumId: number) => {
    if (albumId !== Number(getAlbumToken(this.props.pageKey))) {
      return;
    }

    this.fetchImagesByAlbumId(albumId);
  }

  private handlePageNavigation = (newPageKey: string) => {
    if (!isAAlbum(newPageKey)) return;

    const albumId = Number(getAlbumToken(newPageKey));
    this.fetchImagesByAlbumId(albumId);
  }

  private async fetchImagesByAlbumId(albumId: number) {
    try {
      const data = await ipcRenderer.invoke(ClientMessageType.GetImagesByAlbumId, albumId);
      this.setState({
        images: data,
      });
    } catch (err) {
      console.error(err);
    }
  }

  private handleImportButtonClicked = (e: React.MouseEvent) => {
    const { pageKey } = this.props;
    eventBus.emit(RendererEvents.ShowModal, ModalTypes.ImportPhotosToAlbum, pageKey);
  }

  private renderImageItems() {
    return this.state.images.map((item: ImageWithThumbnails) => {
      return (
        <GridViewImageItem
          key={`data-${item.id}`}
          data={item}
          isSelected={false}
          scaleToFit
        />
      );
    });
  }

  private handleGridContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log(e);
    if (e.target !== this.__containerRef.current) {
      return;
    }

    ipcRenderer.invoke(ClientMessageType.ShowContextMenu, ContextMenuType.AlbumContent);
  }

  render() {
    const { images } = this.state;
    if (images.length <= 0) {
      return (
        <MainContentContainer>
          <ImportButton
            onClick={this.handleImportButtonClicked}
            textContent="Add images from My Photos to thie album..."
          />
        </MainContentContainer>
      );
    }

    return (
      <GridViewContainer ref={this.__containerRef}  onContextMenu={this.handleGridContextMenu}>
        <GridViewLayout>
          {this.renderImageItems()}
        </GridViewLayout>
      </GridViewContainer>
    );
  }

}

export default AlbumContentPage;
