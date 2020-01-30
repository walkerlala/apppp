import * as React from 'react';
import { produce } from 'immer';
import SidebarTreeItem, { TreeItemData  } from './SidebarTreeItem';
import { eventBus, RendererEvents } from 'renderer/events';
import { PageKey } from 'renderer/pageKey';
import MediaServicesScaleLargeIcon from '@atlaskit/icon/glyph/media-services/scale-large';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import DashboardIcon from '@atlaskit/icon/glyph/dashboard';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import { isUndefined } from 'lodash';
import { Album } from 'common/album';
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
        children: this.renderAlbumChildren,
      },
      {
        key: PageKey.Workspaces,
        label: 'Workspaces',
        icon: <DashboardIcon label="Workspaces" />,
        hasAddIcon: true,
        hasChildren: true,
      }
    ]);

    this.state = {
      childrenMap,
      expandedKeys: new Set(),
    };
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
    eventBus.emit(RendererEvents.SidebarTreeClicked, key);
  }

  private handleAddButtonClick = (key: string) => async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    switch (key) {
      case PageKey.Albums:
        return this.handleAddAlbum(key);

      default:
        // nothing

    }
  }

  private async handleAddAlbum(key: PageKey) {
    try {
      this.addExpandedKeys(key);
      const album: Album = await ipcRenderer.invoke(ClientMessageType.CreateAlbum);
      const newMap = produce(this.state.childrenMap, (draft: Map<string, TreeItemData[]>) => {
        let items = draft.get(PageKey.Albums);
        if (isUndefined(items)) {
          items = [];
        }
        items = [
          {
            key: `album-${key}`,
            label: album.name,
          },
          ...items,
        ]
        draft.set(PageKey.Albums, items);
      });
      this.setState({
        childrenMap: newMap,
      });
    } catch (err) {
      console.error(err);
    }
  }

  private renderAlbumChildren = () => {
    const items = this.state.childrenMap.get(PageKey.Albums);
    if (isUndefined(items)) {
      return;
    }

    return this.renderChildren(items);
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
          onExpand={() => this.addExpandedKeys(item.key)}
          onCollapse={() => this.removeExpandedKeys(item.key)}
          showAddButton={isMouseEntered}
        />
      );
    })
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
