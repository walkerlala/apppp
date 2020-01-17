import React, { Component } from 'react';

class SidebarItem extends Component {

  render() {
    const { children } = this.props;
    return (
      <div>
        {children}
      </div>
    );
  }

}

class Sidebar extends Component {

  render() {
    return (
      <div id="sidebar-container">
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
