import * as React from 'react';
import { observable, action, runInAction } from 'mobx';
import { PageKey, AlbumPrefix, isAWorkspace, getWorkspaceToken, WorkspacePrefix } from 'renderer/pageKey';
import MediaServicesScaleLargeIcon from '@atlaskit/icon/glyph/media-services/scale-large';
import DashboardIcon from '@atlaskit/icon/glyph/dashboard';
import { ipcRenderer } from 'electron';
import { Album } from 'common/album';
import { ClientMessageType } from 'common/message';
import { Workspace } from 'common/workspace';
import { IDisposable } from 'common/disposable';
import AlbumIcon from './AlbumIcon.svg';
import { isUndefined } from 'util';

export enum AddIconOption {
  Invisible = 0,
  ShowOnHover,
  ShowOnHoverSidebar,
}

export interface TreeItem {
  parentKey? : string;
  key: string;
  label: string;
  icon?: React.ReactNode;
  addIconOption?: AddIconOption;
  hasChildren?: boolean;
  workspace?: Workspace;
  album?: Album;
}

export class TreeData implements IDisposable {

  @observable
  dataMap: Map<string, TreeItem> = new Map();

  @observable
  childrenMap: Map<string, string[]> = new Map();

  constructor() {
    this.dataMap.set(PageKey.MyPhotos, {
      key: PageKey.MyPhotos,
      label: 'My Photos',
      icon: <MediaServicesScaleLargeIcon label="My Photos" />,
    });
    this.dataMap.set(PageKey.Albums, {
      key: PageKey.Albums,
      label: 'Albums',
      icon: <AlbumIcon />,
      addIconOption: AddIconOption.ShowOnHoverSidebar,
      hasChildren: true,
    });
    this.dataMap.set(PageKey.Workspaces, {
      key: PageKey.Workspaces,
      label: 'Workspaces',
      icon: <DashboardIcon label="Workspaces" />,
      addIconOption: AddIconOption.ShowOnHoverSidebar,
      hasChildren: true,
    });

    ipcRenderer.addListener(ClientMessageType.WorkspaceDeleted, this.handleWorkspaceDeleted);
  }

  getChildrenByParentId(parentKey: string): TreeItem[] {
    const childrenIds = this.childrenMap.get(parentKey);

    if (isUndefined(childrenIds)) {
      return [];
    }

    const children: TreeItem[] = []

    childrenIds.forEach(id => {
      const item = treeStore.dataMap.get(id);
      if (isUndefined(item)) {
        return [];
      }
      children.push(item);
    });

    return children;
  }

  @action
  async fetchAllAlbums() {
    const albums: Album[] = await ipcRenderer.invoke(ClientMessageType.GetAllAlbums);
    runInAction(() => {
      let childrenKey: string[] = [];
      albums.forEach(album => {
        const key = AlbumPrefix + album.id;
        const data: TreeItem = {
          parentKey: PageKey.Albums,
          key,
          icon: <AlbumIcon />,
          label: album.name,
          album,
        };
        this.dataMap.set(key, data);
        childrenKey.push(key);
      });
      this.childrenMap.set(PageKey.Albums, childrenKey);
    });
  }

  @action
  async fetchWorkspaces(parentKey: string) {
    if (!isAWorkspace(parentKey)) {
      return;
    }
    const parentToken = getWorkspaceToken(parentKey);
    const result: Workspace[] = await ipcRenderer.invoke(
      ClientMessageType.GetWorkspacesByParentId, Number(parentToken),
    );
    runInAction(() => {
      let childrenKey: string[] = [];
      result.forEach(workspace => {
        const key = WorkspacePrefix + workspace.id;
        const data: TreeItem = {
          parentKey,
          key,
          label: workspace.name,
          addIconOption: AddIconOption.ShowOnHover,
          icon: <DashboardIcon label="Workspaces" />,
          hasChildren: true,
          workspace,
        };
        this.dataMap.set(key, data);
        childrenKey.push(key);
      });
      this.childrenMap.set(parentKey, childrenKey);
    });
  }

  @action
  private handleWorkspaceDeleted = (event: any, wp: Workspace) => {
    const key = WorkspacePrefix + wp.id;
    const itemData = this.dataMap.get(key);
    if (isUndefined(itemData)) {
      return;
    }

    this.dataMap.delete(key);

    const parentKey = itemData.parentKey;
    if (isUndefined(parentKey)) {
      return;
    }

    const childArr = this.childrenMap.get(parentKey);
    if (isUndefined(childArr)) {
      return;
    }

    const newArr = childArr.filter(childKey => childKey !== key);
    this.childrenMap.set(parentKey, newArr);
  }

  dispose() {
    ipcRenderer.removeListener(ClientMessageType.WorkspaceDeleted, this.handleWorkspaceDeleted);
  }

}

const treeStore = new TreeData;

export default treeStore;
