import * as React from 'react';
import { PageKey } from 'renderer/pageKey';
import AddIcon from '@atlaskit/icon/glyph/add';

export interface TreeItemData {
  key: PageKey;
  label: string;
  icon?: React.ReactNode;
  hasAddIcon?: boolean;
}

export interface SidebarTreeItemProps {
  data: TreeItemData,
  isSelected: boolean;
  showAddButton: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onAddButtonClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

class SidebarTreeItem extends React.Component<SidebarTreeItemProps> {

  private renderAddIcon() {
    const { onAddButtonClick } = this.props;
    const primaryColor = 'rgb(146, 144, 140)';
    return (
      <div className="ani-add-icon-area">
        <div
          className="ani-icon-rect"
          style={{
            borderColor: primaryColor,
          }}
          onClick={onAddButtonClick}
        >
          <AddIcon primaryColor={primaryColor} label="add-icon" size="small" />
        </div>
      </div>
    )
  }

  render() {
    const { label, icon, hasAddIcon } = this.props.data;
    let containerClassName = 'ani-sidebar-tree-item noselect';
    if (this.props.isSelected) {
      containerClassName += " ani-item-selected";
    }
    return (
      <div onClick={this.props.onClick} className={containerClassName}>
        <div className="ani-icon-area">
          {icon}
        </div>
        <div className="ani-content-area">{label}</div>
        {this.props.showAddButton && hasAddIcon && this.renderAddIcon()}
      </div>
    );
  }

}

export default SidebarTreeItem;
