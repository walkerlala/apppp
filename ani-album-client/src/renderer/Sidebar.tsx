import React, { Component } from 'react';
import SidebarTree from 'renderer/SidebarTree';
import './Sidebar.scss';

interface SidebarState {
  isMouseEntered: boolean
}

class Sidebar extends Component<{}, SidebarState> {

  constructor(props: {}) {
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
    const { isMouseEntered } = this.state;
    return (
      <div
        className="ani-sidebar-container"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <SidebarTree isMouseEntered={isMouseEntered} />
      </div>
    );
  }

}

export default Sidebar;
