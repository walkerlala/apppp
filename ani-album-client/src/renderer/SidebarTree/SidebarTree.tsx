import * as React from 'react';
import { produce } from 'immer';
import SidebarTreeItem, { TreeItemData  } from './SidebarTreeItem';
import { eventBus, RendererEvents } from 'renderer/events';
import { PageKey, AlbumPrefix, getWorkspaceToken, isAWorkspace, WorkspacePrefix } from 'renderer/pageKey';
import MediaServicesScaleLargeIcon from '@atlaskit/icon/glyph/media-services/scale-large';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import DashboardIcon from '@atlaskit/icon/glyph/dashboard';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import { isUndefined } from 'lodash';
import { Album } from 'common/album';
import { Workspace } from 'common/workspace';

import './SidebarTree.scss';

export interface SidebarTreeProps {
  pageKey: string;
  isMouseEntered: boolean
}

export interface SidebarTreeState {
  childrenMap: Map<string, TreeItemData[]>
  expandedKeys: Set<string>;
}

class SidebarTree extends React.Component<SidebarTreeProps, SidebarTreeState> {

  constructor(props: SidebarTreeProps) {
    super(props);
    const childrenMap: Map<string, TreeItemData[]> = new Map();
    childrenMap.set(PageKey.Root, [
      {
        key: PageKey.MyPhotos,
        label: 'My Photos',
        icon: <MediaServicesScaleLargeIcon label="My Photos" />
      },
      {
        key: PageKey.Albums,
        label: 'Albums',
        icon: <FolderIcon label="Albums" />,
        hasAddIcon: true,
        hasChildren: true,
        children: () => this.renderChildrenByParentKey(PageKey.Albums),
      },
      {
        key: PageKey.Workspaces,
        label: 'Workspaces',
        icon: <DashboardIcon label="Workspaces" />,
        hasAddIcon: true,
        hasChildren: true,
        children: () => this.renderChildrenByParentKey(PageKey.Workspaces),
      }
    ]);

    this.state = {
      childrenMap,
      expandedKeys: new Set(),
    };
  }

  componentDidMount() {
    eventBus.addListener(RendererEvents.AlbumInfoUpdated, this.handleAlbumInfoUpdated);
  }

  componentWillUnmount() {
    eventBus.removeListener(RendererEvents.AlbumInfoUpdated, this.handleAlbumInfoUpdated);
  }

  private addExpandedKeys = (key: string) => {
    const selectedKeys = produce(this.state.expandedKeys, (draft: Set<string>) => {
      draft.add(key);
    });
    this.setState({ expandedKeys: selectedKeys });
  }

  private removeExpandedKeys = (key: string) => {
    const selectedKeys = produce(this.state.expandedKeys, (draft: Set<string>) => {
      draft.delete(key);
    });
    this.setState({ expandedKeys: selectedKeys });
  }

  private handleTreeItemClick = (key: string) => (e: React.MouseEvent<HTMLDivElement>) => {
    eventBus.emit(RendererEvents.NavigatePage, key);
  }

  private handleAddButtonClick = (key: string) => async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    switch (key) {
      case PageKey.Albums:
        return this.handleAddAlbum(key);


      case PageKey.Workspaces:
        return this.handleAddWorkspace(key);

      default:
        // nothing

    }
  }

  private handleAlbumInfoUpdated = (albumId: number) => {
    this.fetchAllAlbums();
  }

  private async handleAddAlbum(key: PageKey) {
    this.addExpandedKeys(key);
    try {
      const album: Album = await ipcRenderer.invoke(ClientMessageType.CreateAlbum);
      await this.fetchAllAlbums();
      const newPageKey = AlbumPrefix + album.id.toString();
      eventBus.emit(RendererEvents.NavigatePage, newPageKey);
    } catch (err) {
      console.error(err);
    }
  }

  private async handleAddWorkspace(parentKey: PageKey) {
    if (!isAWorkspace(parentKey)) {
      return;
    }
    this.addExpandedKeys(parentKey);
    try {
      const parentToken = getWorkspaceToken(parentKey);
      const wp: Workspace = await ipcRenderer.invoke(ClientMessageType.CreateWorkspace, Number(parentToken));
      await this.fetchWorkspaces(parentKey);
      const newPageKey = WorkspacePrefix + wp.id.toString();
      eventBus.emit(RendererEvents.NavigatePage, newPageKey);
    } catch (err) {
      console.error(err);
    }
  }

  private renderChildrenByParentKey(key: PageKey) {
    const items = this.state.childrenMap.get(key);
    if (isUndefined(items)) {
      return;
    }

    return this.renderChildren(items);
  }

  private async fetchAllAlbums() {
    const albums: Album[] = await ipcRenderer.invoke(ClientMessageType.GetAllAlbums);
    const newMap = produce(this.state.childrenMap, (draft: Map<string, TreeItemData[]>) => {
      const items = albums.map(({ id, name }) => ({
        key: `Album-${id}`,
        label: name,
      }));
      draft.set(PageKey.Albums, items);
    });
    this.setState({
      childrenMap: newMap,
    });
  }

  private async fetchWorkspaces(parentKey: string) {
    if (!isAWorkspace(parentKey)) {
      return;
    }
    const parentToken = getWorkspaceToken(parentKey);
    try {
      const result: Workspace[] = await ipcRenderer.invoke(
        ClientMessageType.GetWorkspacesByParentId, Number(parentToken),
      );
      const newMap = produce(this.state.childrenMap, (draft: Map<string, TreeItemData[]>) => {
        const items = result.map(({ id, name }) => ({
          key: WorkspacePrefix + id.toString(),
          label: name,
        }));
        draft.set(parentKey, items);
      });
      this.setState({
        childrenMap: newMap,
      });
    } catch (err) {
      console.error(err);
    }
  }

  private handleItemExpanded = (key: string) => {
    if (key === PageKey.Albums) {
      this.fetchAllAlbums();
    } else if (isAWorkspace(key)) {
      this.fetchWorkspaces(key);
    }
    this.addExpandedKeys(key);
  }

  renderChildren(items: TreeItemData[]) {
    const { isMouseEntered, pageKey } = this.props;
    return items.map(item => {
      return (
        <SidebarTreeItem
          key={item.key}
          isExpanded={this.state.expandedKeys.has(item.key)}
          isSelected={item.key === pageKey}
          data={item}
          onClick={this.handleTreeItemClick(item.key)}
          onAddButtonClick={this.handleAddButtonClick(item.key)}
          onExpand={() => this.handleItemExpanded(item.key)}
          onCollapse={() => this.removeExpandedKeys(item.key)}
          showAddButton={isMouseEntered}
        />
      );
    });
  }

  render() {
    const rootChildren = this.state.childrenMap.get(PageKey.Root) || [];
    return (
      <div className="ani-sidebar-tree">
        {this.renderChildren(rootChildren)}
      </div>
    );
  }

}

export default SidebarTree;
