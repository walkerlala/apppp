import * as React from 'react';
import { produce } from 'immer';
import './SidebarTree.scss';
import SidebarTreeItem, { TreeItemData } from './SidebarTreeItem';

export interface SidebarTreeState {
  childrenMap: Map<string, TreeItemData[]>
  expandedKeys: Set<string>;
  selectedKey: string;
}

const PreserveRootKey = '__root';

class SidebarTree extends React.Component<{}, SidebarTreeState> {

  constructor(props: {}) {
    super(props);
    const childrenMap: Map<string, TreeItemData[]> = new Map();
    childrenMap.set(PreserveRootKey, [
      {
        label: 'My Photos',
      },
      {
        label: 'Albums',
      },
      {
        label: 'Workspaces',
      }
    ]);

    this.state = {
      childrenMap,
      expandedKeys: new Set(),
      selectedKey: '',
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

  renderChildren(items: TreeItemData[]) {
    return items.map(item => {
      return <SidebarTreeItem data={item} />
    })
  }

  render() {
    const rootChildren = this.state.childrenMap.get(PreserveRootKey) || [];
    return (
      <div className="ani-sidebar-tree">
        {this.renderChildren(rootChildren)}
      </div>
    );
  }

}

export default SidebarTree
