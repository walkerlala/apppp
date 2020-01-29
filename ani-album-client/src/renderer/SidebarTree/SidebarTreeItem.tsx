import * as React from 'react';

export interface TreeItemData {
  label: string;
}

export interface SidebarTreeItemProps {
  data: TreeItemData,
}

class SidebarTreeItem extends React.PureComponent<SidebarTreeItemProps> {

  render() {
    const { label } = this.props.data;
    return (
      <div className="ani-sidebar-tree-item noselect">
        {label}
      </div>
    );
  }

}

export default SidebarTreeItem;
