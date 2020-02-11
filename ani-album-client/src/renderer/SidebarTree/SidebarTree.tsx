import { observable, action, runInAction } from 'mobx';
import { observer, inject } from 'mobx-react'
import * as React from 'react';
import SidebarTreeItem from './SidebarTreeItem';
import { eventBus, RendererEvents } from 'renderer/events';
import { PageKey, AlbumPrefix, getWorkspaceToken, isAWorkspace, WorkspacePrefix } from 'renderer/pageKey';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import { isUndefined } from 'lodash';
import { Album } from 'common/album';
import { Workspace } from 'common/workspace';
import { TreeData, TreeItem } from 'renderer/data/tree';

import './SidebarTree.scss';

export interface SidebarTreeProps {
  pageKey: string;
  isMouseEntered: boolean
  treeStore?: TreeData;
}

@inject('treeStore')
@observer
class SidebarTree extends React.Component<SidebarTreeProps> {

  @observable
  private expandedKeys: Set<string> = new Set();

  constructor(props: SidebarTreeProps) {
    super(props);
  }

  componentDidMount() {
    eventBus.addListener(RendererEvents.AlbumInfoUpdated, this.handleAlbumInfoUpdated);
    eventBus.addListener(RendererEvents.WorkspaceInfoUpdated, this.handleWorkspaceInfoUpdated);
  }

  componentWillUnmount() {
    eventBus.removeListener(RendererEvents.AlbumInfoUpdated, this.handleAlbumInfoUpdated);
    eventBus.removeListener(RendererEvents.WorkspaceInfoUpdated, this.handleWorkspaceInfoUpdated);
  }

  @action
  private addExpandedKeys = async (key: string) => {
    this.expandedKeys.add(key);
  }

  @action
  private removeExpandedKeys = async (key: string) => {
    this.expandedKeys.delete(key);
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

      default:
        if (isAWorkspace(key)) {
          return this.handleAddWorkspace(key);
        }

    }
  }

  private handleWorkspaceInfoUpdated = async (workspaceId: number) => {
    try {
      const workspaceInfo: Workspace = await ipcRenderer.invoke(ClientMessageType.GetWorkspaceById, workspaceId);
      await this.props.treeStore.fetchWorkspaces(WorkspacePrefix + workspaceInfo.parentId);
    } catch (err) {
      console.error(err);
    }
  }

  private handleAlbumInfoUpdated = async (albumId: number) => {
    try {
      await this.props.treeStore.fetchAllAlbums();
    } catch (err) {
      console.error(err);
    }
  }

  private async handleAddAlbum(key: PageKey) {
    this.addExpandedKeys(key);
    try {
      const album: Album = await ipcRenderer.invoke(ClientMessageType.CreateAlbum);
      await this.props.treeStore.fetchAllAlbums();
      const newPageKey = AlbumPrefix + album.id.toString();
      eventBus.emit(RendererEvents.NavigatePage, newPageKey);
    } catch (err) {
      console.error(err);
    }
  }

  private async handleAddWorkspace(parentKey: string) {
    if (!isAWorkspace(parentKey)) {
      throw new Error('key error');
    }
    const { treeStore } = this.props;
    this.addExpandedKeys(parentKey);
    try {
      const parentToken = getWorkspaceToken(parentKey);
      const wp: Workspace = await ipcRenderer.invoke(ClientMessageType.CreateWorkspace, Number(parentToken));
      await treeStore.fetchWorkspaces(parentKey);
      const newPageKey = WorkspacePrefix + wp.id.toString();
      eventBus.emit(RendererEvents.NavigatePage, newPageKey);
    } catch (err) {
      console.error(err);
    }
  }

  private renderChildrenByParentKey(key: string, depth: number) {
    const { treeStore } = this.props;
    const childrenIds = treeStore.childrenMap.get(key);

    if (isUndefined(childrenIds)) {
      return;
    }

    const children: TreeItem[] = []

    childrenIds.forEach(id => {
      const item = treeStore.dataMap.get(id);
      if (isUndefined(item)) {
        return;
      }
      children.push(item);
    });

    return this.renderChildren(children, depth);
  }

  private handleItemExpanded = async (key: string) => {
    const { treeStore } = this.props;
    this.addExpandedKeys(key);
    try {
      if (key === PageKey.Albums) {
        await treeStore.fetchAllAlbums();
      } else if (isAWorkspace(key)) {
        await treeStore.fetchWorkspaces(key);
      }
    } catch (err) {
      console.error(err);
    }
  }

  renderChildren(items: TreeItem[], depth: number) {
    const { isMouseEntered, pageKey } = this.props;
    return items.map(item => {
      return (
        <SidebarTreeItem
          key={item.key}
          isExpanded={this.expandedKeys.has(item.key)}
          isSelected={item.key === pageKey}
          data={item}
          onClick={this.handleTreeItemClick(item.key)}
          onAddButtonClick={this.handleAddButtonClick(item.key)}
          onExpand={() => this.handleItemExpanded(item.key)}
          onCollapse={() => this.removeExpandedKeys(item.key)}
          isSidebarMouseEnter={isMouseEntered}
          depth={depth}
        >
          {(parentDepth: number) => this.renderChildrenByParentKey(item.key, parentDepth + 1)}
        </SidebarTreeItem>
      );
    });
  }

  render() {
    const { treeStore } = this.props;
    const rootChildren = [
      treeStore.dataMap.get(PageKey.MyPhotos),
      treeStore.dataMap.get(PageKey.Albums),
      treeStore.dataMap.get(PageKey.Workspaces),
    ];
    return (
      <div className="ani-sidebar-tree">
        {this.renderChildren(rootChildren, 0)}
      </div>
    );
  }

}

export default SidebarTree;
