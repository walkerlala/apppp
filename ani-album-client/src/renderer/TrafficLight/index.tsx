import React from 'react';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import './TrafficLight.scss';

interface TrafficLightState {
  isMouseEntered: boolean
  isWindowActive: boolean
}

interface TrafficLightProps {
  isFullscreen: boolean
}

class TrafficLight extends React.Component<TrafficLightProps, TrafficLightState> {

  constructor(props: TrafficLightProps) {
    super(props);

    this.state = {
      isMouseEntered: false,
      isWindowActive: true
    };
  }

  private handleTrafficLightEvent = (e: React.SyntheticEvent<HTMLElement>) => {
    e.persist();
    e.stopPropagation();

    if (e.target instanceof HTMLElement) {
      !e.target.classList.contains('disabled') &&
      ipcRenderer.send(e.target.dataset.type);
    }
  }

  private handleToggleActive = (e: any, isActive: boolean) => {
    this.setState({ isWindowActive: isActive });
  }

  componentDidMount() {
    ipcRenderer.addListener(ClientMessageType.ToggleActive, this.handleToggleActive);
  }

  render() {
    const { isFullscreen } = this.props;
    const { isWindowActive } = this.state;

    return (
      <div className="ani-sidebar-traffic-light">
        <div
          className={`ani-sidebar-traffic-light-container ${!isWindowActive && 'inactive'}`}
          onClick={this.handleTrafficLightEvent}>
          <div data-type="close" />
          <div data-type="min" className={ isFullscreen ? 'disabled' : ''} />
          <div data-type={isFullscreen ? 'fullscreenoff' : 'fullscreen'} />
        </div>
      </div>
    );
  }
}

export default TrafficLight;
