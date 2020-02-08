import * as React from 'react';
import ImportButton from 'renderer/components/ImportButton';
import { eventBus, RendererEvents } from 'renderer/events';
import { ModalTypes } from 'renderer/Modals';
import { MainContentContainer } from 'renderer/styles';
import { ImageWithThumbnails } from 'common/image';
import { getWorkspaceToken, isAWorkspace } from 'renderer/pageKey';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import GridViewLayout from 'renderer/components/GridView/GridViewLayout';
import GridViewImageItem from 'renderer/components/GridView/ImageItem';
import { GridViewContainer } from './styles';

export interface WorkspaceContentPageProps {
  pageKey: string;
}

interface State {
  images: ImageWithThumbnails[];
}

class WorkspaceContentPage extends React.Component<WorkspaceContentPageProps, State> {

  constructor(props: WorkspaceContentPageProps) {
    super(props);
    this.state = {
      images: [],
    };
  }

  componentDidMount() {
    eventBus.addListener(RendererEvents.NavigatePage, this.handlePageNavigation);
    eventBus.addListener(RendererEvents.WorkspaceContentUpated, this.handleWorkspaceContentChanged);

    const workspaceId = Number(getWorkspaceToken(this.props.pageKey));
    this.fetchImagesByWorkspaceId(workspaceId);
  }

  componentWillUnmount() {
    eventBus.removeListener(RendererEvents.NavigatePage, this.handlePageNavigation);
    eventBus.removeListener(RendererEvents.WorkspaceContentUpated, this.handleWorkspaceContentChanged);
  }

  private handleWorkspaceContentChanged = (workspaceId: number) => {
    if (workspaceId !== Number(getWorkspaceToken(this.props.pageKey))) {
      return;
    }

    this.fetchImagesByWorkspaceId(workspaceId);
  }

  private handlePageNavigation = (newPageKey: string) => {
    if (!isAWorkspace(newPageKey)) return;

    const wpId = Number(getWorkspaceToken(newPageKey));
    this.fetchImagesByWorkspaceId(wpId);
  }

  private handleImportImages = () => {
    const { pageKey } = this.props;
    eventBus.emit(RendererEvents.ShowModal, ModalTypes.ImportPhotosToAlbum, pageKey);
  }

  private async fetchImagesByWorkspaceId(workspaceId: number) {
    try {
      const data = await ipcRenderer.invoke(ClientMessageType.GetImagesByWorkspaceId, workspaceId);
      this.setState({
        images: data,
      });
    } catch (err) {
      console.error(err);
    }
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

  private renderImages() {
    return (
      <GridViewContainer>
        <GridViewLayout>
          {this.renderImageItems()}
        </GridViewLayout>
      </GridViewContainer>
    );
  }

  render() {
    const { images } = this.state;
    if (images.length > 0) {
      return this.renderImages();
    }

    return (
      <MainContentContainer>
        <ImportButton
          onClick={this.handleImportImages}
          textContent="Import images from My Photos to the workspace..."
        />
      </MainContentContainer>
    );
  }

}

export default WorkspaceContentPage;
