import * as React from 'react';
import { MainContentContainer } from 'renderer/styles';
import ImportButton from 'renderer/components/ImportButton';
import { eventBus, RendererEvents } from 'renderer/events';
import { ModalTypes } from 'renderer/Modals';
import GridView from 'renderer/components/GridView';
import { ImageEntity } from 'common/image';
import { ClientMessageType } from 'common/message';
import { ipcRenderer } from 'electron';
import { getAlbumToken } from 'renderer/pageKey';

export interface AlbumContentPageProps {
  pageKey: string;
}

interface State {
  images: ImageEntity[];
  shouldFetch: boolean;
  prevPageKey: string;
}

class AlbumContentPage extends React.Component<AlbumContentPageProps, State> {

  static getDerivedStateFromProps(props: AlbumContentPageProps, state: State) {
    if (props.pageKey !== state.prevPageKey) {
      return {
        ...state,
        shouldFetch: true,
      };
    }

    return state;
  }

  constructor(props: AlbumContentPageProps) {
    super(props);
    this.state = {
      images: [],
      shouldFetch: true,
      prevPageKey: props.pageKey,
    };
  }

  componentDidUpdate() {
    const { shouldFetch } = this.state;

    if (shouldFetch) {
      this.fetchImagesByAlbumId();
    }
  }

  private async fetchImagesByAlbumId() {
    const albumId = Number(getAlbumToken(this.props.pageKey));

    try {
      const data = await ipcRenderer.invoke(ClientMessageType.GetImagesByAlbumId, albumId);
      this.setState({
        images: data,
      });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({
        shouldFetch: false,
      });
    }
  }

  private handleImportButtonClicked = (e: React.MouseEvent) => {
    const { pageKey } = this.props;
    eventBus.emit(RendererEvents.ShowModal, ModalTypes.ImportPhotosToAlbum, pageKey);
  }

  private renderContent() {
    const { images } = this.state;
    if (images.length <= 0) {
      return (
        <ImportButton
          onClick={this.handleImportButtonClicked}
          textContent="Add images from My Photos to Album..."
        />
      );
    }

    return (
      <GridView />
    );
  }

  render() {
    return (
      <MainContentContainer>
        {this.renderContent()}
      </MainContentContainer>
    );
  }

}

export default AlbumContentPage;
