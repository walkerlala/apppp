import React, { Component } from 'react';
import SidebarTree from 'renderer/SidebarTree';
import './Sidebar.scss';

class Sidebar extends Component {

  render() {
    return (
      <div className="ani-sidebar-container">
        <SidebarTree />
      </div>
    );
  }

}

export default Sidebar;
