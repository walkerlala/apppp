import * as React from 'react';
import { produce } from 'immer';
import SidebarTreeItem, { TreeItemData, TreeItemKey } from './SidebarTreeItem';
import MediaServicesScaleLargeIcon from '@atlaskit/icon/glyph/media-services/scale-large';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import DashboardIcon from '@atlaskit/icon/glyph/dashboard';
import './SidebarTree.scss';

export interface SidebarTreeState {
  childrenMap: Map<string, TreeItemData[]>
  expandedKeys: Set<string>;
  selectedKey: string;
}

class SidebarTree extends React.Component<{}, SidebarTreeState> {

  constructor(props: {}) {
    super(props);
    const childrenMap: Map<string, TreeItemData[]> = new Map();
    childrenMap.set(TreeItemKey.Root, [
      {
        key: TreeItemKey.MyPhotos,
        label: 'My Photos',
        icon: <MediaServicesScaleLargeIcon label='My Photos' />
      },
      {
        key: TreeItemKey.Albums,
        label: 'Albums',
        icon: <FolderIcon label="Albums" />
      },
      {
        key: TreeItemKey.Workspaces,
        label: 'Workspaces',
        icon: <DashboardIcon label="Workspaces" />
      }
    ]);

    this.state = {
      childrenMap,
      expandedKeys: new Set(),
      selectedKey: TreeItemKey.MyPhotos,
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

  private handleTreeItemClick = (key: TreeItemKey) => (e: React.MouseEvent<HTMLDivElement>) => {
    this.setState({
      selectedKey: key,
    });
  }

  renderChildren(items: TreeItemData[]) {
    const { selectedKey } = this.state;
    return items.map(item => {
      return (
        <SidebarTreeItem
          key={item.key}
          isSelected={item.key === selectedKey}
          data={item}
          onClick={this.handleTreeItemClick(item.key)}
        />
      );
    })
  }

  render() {
    const rootChildren = this.state.childrenMap.get(TreeItemKey.Root) || [];
    return (
      <div className="ani-sidebar-tree">
        {this.renderChildren(rootChildren)}
      </div>
    );
  }

}

export default SidebarTree
