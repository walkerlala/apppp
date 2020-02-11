import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { eventBus, RendererEvents } from 'renderer/events';
import { Workspace } from 'common/workspace';
import { ImageWithThumbnails } from 'common/image';
import { getWorkspaceToken, isAWorkspace, WorkspacePrefix } from 'renderer/pageKey';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import GridViewLayout from 'renderer/components/GridView/GridViewLayout';
import GridViewImageItem from 'renderer/components/GridView/ImageItem';
import { ContentContainer, GridViewContainer, Heading, WorkspacesContainer } from './styles';
import WorkspaceItem from './WorkspaceItem';
import { TreeData } from 'renderer/data/tree';
import { isUndefined } from 'util';

export interface WorkspaceContentPageProps {
  pageKey: string;
  treeStore?: TreeData;
}

interface State {
  images: ImageWithThumbnails[];
}

@inject('treeStore')
@observer
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

    this.props.treeStore.fetchWorkspaces(this.props.pageKey);
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

    this.props.treeStore.fetchWorkspaces(newPageKey);
    // this.fetchWorkspacesByParentId(wpId);
    const wpId = Number(getWorkspaceToken(newPageKey));
    this.fetchImagesByWorkspaceId(wpId);
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

  private handleSubWorkspaceClicked = (id: number) => {
    const pageKey = WorkspacePrefix + id.toString();
    eventBus.emit(RendererEvents.NavigatePage, pageKey);
  }

  private renderWorkspaceItems() {
    const { treeStore } = this.props;
    const children = treeStore.getChildrenByParentId(this.props.pageKey);
    return children.map(treeItem => {
      const { workspace: wp } = treeItem;
      if (isUndefined(wp)) {
        return null;
      }
      return (
        <WorkspaceItem
          key={wp.id} data={wp}
          onClick={this.handleSubWorkspaceClicked}
        />
      );
    });
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
