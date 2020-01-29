import * as React from 'react';
import { produce } from 'immer';
import SidebarTreeItem, { TreeItemData  } from './SidebarTreeItem';
import { eventBus, RendererEvents } from 'renderer/events';
import { PageKey } from 'renderer/pageKey';
import MediaServicesScaleLargeIcon from '@atlaskit/icon/glyph/media-services/scale-large';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import DashboardIcon from '@atlaskit/icon/glyph/dashboard';
import { ModalTypes } from 'renderer/Modals';
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
      },
      {
        key: PageKey.Workspaces,
        label: 'Workspaces',
        icon: <DashboardIcon label="Workspaces" />,
        hasAddIcon: true,
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

  private handleTreeItemClick = (key: PageKey) => (e: React.MouseEvent<HTMLDivElement>) => {
    eventBus.emit(RendererEvents.SidebarTreeClicked, key);
  }

  private handleAddButtonClick = (key: PageKey) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    switch (key) {
      case PageKey.Albums:
        eventBus.emit(RendererEvents.ShowModal, ModalTypes.NewAlbum);
        break;

      default:
        // nothing

    }
  }

  renderChildren(items: TreeItemData[]) {
    const { isMouseEntered, pageKey } = this.props;
    return items.map(item => {
      return (
        <SidebarTreeItem
          key={item.key}
          isSelected={item.key === pageKey}
          data={item}
          onClick={this.handleTreeItemClick(item.key)}
          onAddButtonClick={this.handleAddButtonClick(item.key)}
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

export default SidebarTree
