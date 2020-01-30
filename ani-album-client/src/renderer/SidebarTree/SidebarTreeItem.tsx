import * as React from 'react';
import { PageKey } from 'renderer/pageKey';
import AddIcon from '@atlaskit/icon/glyph/add';
import Triangle from './triangle.svg';

export interface TreeItemData {
  key: string;
  label: string;
  icon?: React.ReactNode;
  hasAddIcon?: boolean;
  hasChildren?: boolean;
  children?: () => React.ReactNode,
}

export interface SidebarTreeItemProps {
  data: TreeItemData,
  isSelected: boolean;
  isExpanded: boolean;
  showAddButton: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onAddButtonClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onExpand?: () => void;
  onCollapse?: () => void;
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

  private onTriangleAreaClicked = (e: React.MouseEvent) => {
    if (!this.props.data.hasChildren) return;
    e.preventDefault();
    e.stopPropagation();

    if (this.props.isExpanded) {
      if (this.props.onCollapse) {
        this.props.onCollapse();
      }
    } else {
      if (this.props.onExpand) {
        this.props.onExpand();
      }
    }
  }

  render() {
    const { label, icon, hasAddIcon, hasChildren, children } = this.props.data;
    let containerClassName = 'ani-sidebar-tree-item noselect';
    if (this.props.isSelected) {
      containerClassName += ' ani-item-selected';
    }
    let triangleAreaClassName = 'ani-triangle-area';
    if (this.props.isExpanded) {
      triangleAreaClassName += ' ani-expanded';
    }
    return (
      <div className="ani-sidebar-tree-item-container">
        <div onClick={this.props.onClick} className={containerClassName}>
          <div className={triangleAreaClassName} onClick={this.onTriangleAreaClicked}>
            {hasChildren && <Triangle />}
          </div>
          <div className="ani-icon-area">
            {icon}
          </div>
          <div className="ani-content-area">{label}</div>
          {this.props.showAddButton && hasAddIcon && this.renderAddIcon()}
        </div>
        { hasChildren && children && children() }
      </div>
    );
  }

}

export default SidebarTreeItem;
