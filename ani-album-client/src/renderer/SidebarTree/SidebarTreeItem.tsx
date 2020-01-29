import * as React from 'react';

export enum TreeItemKey {
  Root = '__root',
  MyPhotos = 'my-photos',
  Albums = 'albums',
  Workspaces = 'workspaces',
}

export interface TreeItemData {
  key: TreeItemKey;
  label: string;
  icon?: React.ReactNode;
}

export interface SidebarTreeItemProps {
  data: TreeItemData,
  isSelected: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

class SidebarTreeItem extends React.PureComponent<SidebarTreeItemProps> {

  render() {
    const { label, icon } = this.props.data;
    let containerClassName = 'ani-sidebar-tree-item noselect';
    if (this.props.isSelected) {
      containerClassName += " item-selected";
    }
    return (
      <div onClick={this.props.onClick} className={containerClassName}>
        <div className="icon-area">
          {icon}
        </div>
        {label}
      </div>
    );
  }

}

export default SidebarTreeItem;
