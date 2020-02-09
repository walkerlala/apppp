import React, { Component } from 'react';
import TrafficLight from 'renderer/TrafficLight';
import SidebarTree from 'renderer/SidebarTree';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import './Sidebar.scss';

interface SidebarProps {
  pageKey: string;
}

interface SidebarState {
  isMouseEntered: boolean
  isFullscreen: boolean
  isMacOS: boolean
}

class Sidebar extends Component<SidebarProps, SidebarState> {

  constructor(props: SidebarProps) {
    super(props);
    this.state = {
      isMouseEntered: false,
      isFullscreen: false,
      isMacOS: true
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

  private checkIfNotMacOS = () => {
    const isMacOS = ipcRenderer.sendSync('get-is-macos');
    !isMacOS && this.setState({ isMacOS: false });
  }

  componentDidMount() {
    this.checkIfNotMacOS();

    ipcRenderer.addListener(ClientMessageType.ToggleFullscreen, this.handleToggleFullscreen);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(ClientMessageType.ToggleFullscreen, this.handleToggleFullscreen);
  }

  private handleToggleFullscreen = (e: any, isFullscreen: boolean) => {
    this.setState({ isFullscreen });
  }

  render() {
    const { pageKey } = this.props;
    const { isMouseEntered, isFullscreen, isMacOS } = this.state;

    return (
      <div
        className="ani-sidebar-container"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        { isMacOS && <TrafficLight isFullscreen={isFullscreen} /> }
        <SidebarTree pageKey={pageKey} isMouseEntered={isMouseEntered} />
      </div>
    );
  }

}

export default Sidebar;
