import React, { Component } from 'react';
import TrafficLight from 'renderer/TrafficLight';
import SidebarTree from 'renderer/SidebarTree';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import styled from 'styled-components';

import NavigateBackIcon from './NavigateBackIcon.svg';
import { PageKey } from './pageKey';

const Container = styled.div`
  color: rgb(119, 119, 119);
  background-color: rgb(246, 246, 246);
  width: 200px;
`;

const TopArea = styled.div`
  width: 200px;
  height: 48px;
  -webkit-app-region: drag;

  display: flex;
  align-items: center;
`;

interface GoBackButtonProps {
  show?: boolean;
}

const GoBackButton = styled.button`
  width: 24px;
  height: 24px;
  margin-right: 8px;
  margin-left: auto;
  border-radius: 4px;
  background-color: white;

  display: ${(props: GoBackButtonProps) => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;

  &:focus {
    outline: none;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
  }
`;

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
      <Container
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <TopArea>
          <GoBackButton className="ani-no-drag" show={pageKey !== PageKey.MyPhotos}>
            <NavigateBackIcon />
          </GoBackButton>
        </TopArea>
        { isMacOS && <TrafficLight isFullscreen={isFullscreen} /> }
        <SidebarTree pageKey={pageKey} isMouseEntered={isMouseEntered} />
      </Container>
    );
  }

}

export default Sidebar;
