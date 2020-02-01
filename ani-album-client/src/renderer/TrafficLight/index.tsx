import React from 'react';
import { ipcRenderer } from 'electron';
import './TrafficLight.scss';

interface TrafficLightState {
  isMouseEntered: boolean
}

class TrafficLight extends React.Component<{}, TrafficLightState> {

  constructor(props: {}) {
    super(props);

    this.state = {
      isMouseEntered: false
    };
  }

  private handleTrafficLightEvent = (e: React.SyntheticEvent<HTMLElement>) => {
    e.persist();
    e.stopPropagation();

    if (e.target instanceof HTMLElement) {
      ipcRenderer.send(e.target.dataset.type);
    }
  }

  render() {
    return (
      <div className="ani-sidebar-traffic-light">
        <div
          className="ani-sidebar-traffic-light-container"
          onClick={this.handleTrafficLightEvent}>
          <div data-type="close"></div>
          <div data-type="min"></div>
          <div data-type="fullscreen"></div>
        </div>
      </div>
    );
  }
}

export default TrafficLight;
