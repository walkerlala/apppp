import * as React from 'react';
import { MainContentContainer } from 'renderer/styles';
import ImportButton from 'renderer/components/ImportButton';
import { eventBus, RendererEvents } from 'renderer/events';
import { ModalTypes } from 'renderer/Modals';

export interface AlbumContentPageProps {
  pageKey: string;
}

class AlbumContentPage extends React.Component<AlbumContentPageProps> {

  private handleImportButtonClicked = (e: React.MouseEvent) => {
    const { pageKey } = this.props;
    eventBus.emit(RendererEvents.ShowModal, ModalTypes.ImportPhotosToAlbum, pageKey);
  }

  render() {
    return (
      <MainContentContainer>
        <ImportButton
          onClick={this.handleImportButtonClicked}
          textContent="Add images from My Photos to Album..."
        />
      </MainContentContainer>
    )
  }

}

export default AlbumContentPage;
