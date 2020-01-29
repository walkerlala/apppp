import React, { Component } from 'react';
import SidebarTree from 'renderer/SidebarTree';
import './Sidebar.scss';

interface SidebarProps {
  pageKey: string;
}

interface SidebarState {
  isMouseEntered: boolean
}

class Sidebar extends Component<SidebarProps, SidebarState> {

  constructor(props: SidebarProps) {
    super(props);
    this.state = {
      isMouseEntered: false,
    };
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
    const { pageKey } = this.props;
    const { isMouseEntered } = this.state;
    return (
      <div
        className="ani-sidebar-container"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <SidebarTree pageKey={pageKey} isMouseEntered={isMouseEntered} />
      </div>
    );
  }

}

export default Sidebar;
