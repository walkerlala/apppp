import React, { Component } from 'react';
import './Sidebar.scss';

class SidebarItem extends Component {

  render() {
    const { children } = this.props;
    return (
      <div className="ani-sidebar-item">
        {children}
      </div>
    );
  }

}

class Sidebar extends Component {

  render() {
    return (
      <div className="ani-sidebar-container">
        Sidebar
        <div>
          <SidebarItem>My Photos</SidebarItem>
          <SidebarItem>Favorites</SidebarItem>
          <SidebarItem>Albums</SidebarItem>
        </div>
      </div>
    );
  }

}

export default Sidebar;
