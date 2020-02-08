import * as React from 'react';
import AddIcon from '@atlaskit/icon/glyph/add';
import Triangle from './triangle.svg';

export enum AddIconOption {
  Invisible = 0,
  ShowOnHover,
  ShowOnHoverSidebar,
}

export interface TreeItemData {
  key: string;
  label: string;
  icon?: React.ReactNode;
  addIconOption?: AddIconOption;
  hasChildren?: boolean;
  children?: (parentDepth: number) => React.ReactNode,
}

export interface SidebarTreeItemProps {
  data: TreeItemData,
  isSelected: boolean;
  isExpanded: boolean;
  depth: number;
  isSidebarMouseEnter?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onAddButtonClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onExpand?: () => void;
  onCollapse?: () => void;
}

interface State {
  isMouseEntered: boolean;
}

class SidebarTreeItem extends React.Component<SidebarTreeItemProps, State> {

  constructor(props: SidebarTreeItemProps) {
    super(props);
    this.state = {
      isMouseEntered: false,
    };
  }

  private __renderAddIcon() {
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
    );
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

  private renderAddIcon() {
    switch(this.props.data.addIconOption) {
      case AddIconOption.ShowOnHover:
        if (!this.state.isMouseEntered) {
          return null;
        }
        return this.__renderAddIcon();

      case AddIconOption.ShowOnHoverSidebar:
        if (!this.props.isSidebarMouseEnter) {
          return null;
        }
        return this.__renderAddIcon();

      default:
        return null;

    }
  }

  private handleMouseEnter = (e: React.MouseEvent) => {
    this.setState({
      isMouseEntered: true,
    });
  }

  private handleMouseLeave = (e: React.MouseEvent) => {
    this.setState({
      isMouseEntered: false,
    });
  }

  render() {
    const { depth } = this.props;
    const { label, icon, hasChildren, children } = this.props.data;
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
        <div
          onClick={this.props.onClick}
          className={containerClassName}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          style={{
            paddingLeft: `${depth * 13 + 10}px`,
          }}
        >
          <div className={triangleAreaClassName} onClick={this.onTriangleAreaClicked}>
            {hasChildren && <Triangle />}
          </div>
          <div className="ani-icon-area">
            {icon}
          </div>
          <div className="ani-content-area">{label}</div>
          {this.renderAddIcon()}
        </div>
        { this.props.isExpanded && children && children(depth) }
      </div>
    );
  }

}

export default SidebarTreeItem;
