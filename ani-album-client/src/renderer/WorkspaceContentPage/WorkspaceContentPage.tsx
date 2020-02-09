import * as React from 'react';
import { eventBus, RendererEvents } from 'renderer/events';
import { ModalTypes } from 'renderer/Modals';
import { Workspace } from 'common/workspace';
import { ImageWithThumbnails } from 'common/image';
import { getWorkspaceToken, isAWorkspace } from 'renderer/pageKey';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import GridViewLayout from 'renderer/components/GridView/GridViewLayout';
import GridViewImageItem from 'renderer/components/GridView/ImageItem';
import { ContentContainer, GridViewContainer, Heading, WorkspacesContainer,
  WorkspaceThumbnail, WorkspaceTextContainer } from './styles';
import WorkspaceItem from './WorkspaceItem';

export interface WorkspaceContentPageProps {
  pageKey: string;
}

interface State {
  workspaces: Workspace[];
  images: ImageWithThumbnails[];
}

class WorkspaceContentPage extends React.Component<WorkspaceContentPageProps, State> {

  constructor(props: WorkspaceContentPageProps) {
    super(props);
    this.state = {
      workspaces: [],
      images: [],
    };
  }

  componentDidMount() {
    eventBus.addListener(RendererEvents.NavigatePage, this.handlePageNavigation);
    eventBus.addListener(RendererEvents.WorkspaceContentUpated, this.handleWorkspaceContentChanged);

    const workspaceId = Number(getWorkspaceToken(this.props.pageKey));
    this.fetchWorkspacesByParentId(workspaceId);
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
    this.fetchWorkspacesByParentId(wpId);
    this.fetchImagesByWorkspaceId(wpId);
  }

  // private handleImportImages = () => {
  //   const { pageKey } = this.props;
  //   eventBus.emit(RendererEvents.ShowModal, ModalTypes.ImportPhotosToAlbum, pageKey);
  // }
  
  private async fetchWorkspacesByParentId(parentId: number) {
    try {
      const workspaces: Workspace[] = await ipcRenderer.invoke(ClientMessageType.GetWorkspacesByParentId, parentId);
      this.setState({ workspaces });
    } catch (err) {
      console.error(err);
    }
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

  private renderWorkspaces() {
    return (
      <WorkspacesContainer>
        {this.renderWorkspaceItems()}
      </WorkspacesContainer>
    );
  }

  private renderWorkspaceItems() {
    const { workspaces } = this.state;
    return workspaces.map((wp: Workspace) => (
      <WorkspaceItem key={wp.id} data={wp} />
    ));
  }

  render() {
    return (
      <ContentContainer>
        <Heading className="noselect">Workspaces</Heading>
        {this.renderWorkspaces()}
        <Heading className="noselect">Photos</Heading>
        {this.renderImages()}
      </ContentContainer>
    );
  }

}

export default WorkspaceContentPage;
