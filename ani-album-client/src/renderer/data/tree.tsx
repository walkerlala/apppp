import * as React from 'react';
import { observable, action, runInAction } from 'mobx';
import { PageKey, AlbumPrefix, isAWorkspace, getWorkspaceToken, WorkspacePrefix } from 'renderer/pageKey';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import MediaServicesScaleLargeIcon from '@atlaskit/icon/glyph/media-services/scale-large';
import DashboardIcon from '@atlaskit/icon/glyph/dashboard';
import { ipcRenderer } from 'electron';
import { Album } from 'common/album';
import { ClientMessageType } from 'common/message';
import { Workspace } from 'common/workspace';

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
}

export class TreeData {

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
      icon: <FolderIcon label="Albums" />,
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
          label: album.name,
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
        };
        this.dataMap.set(key, data);
        childrenKey.push(key);
      });
      this.childrenMap.set(parentKey, childrenKey);
    });
  }

}

const treeStore = new TreeData;

export default treeStore;
