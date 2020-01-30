import * as React from 'react';
import ZoomButton from './zoomButton.svg';
import ZoomButton2 from './zoomButton2.svg';
import Slider from 'renderer/Slider';
import SearchBox from 'renderer/SearchBox';
import { eventBus, RendererEvents } from 'renderer/events';
import { debounce } from 'lodash';
import './Header.scss';

interface HeaderState {
  isScaledToFit: boolean
}

class Header extends React.Component<{}, HeaderState> {

  constructor(props: {}) {
    super({});
    this.state = {
      isScaledToFit: true,
    };
  }

  onScaleToButtonClick = debounce((e: React.MouseEvent) => {
    this.setState({
      isScaledToFit: !this.state.isScaledToFit,
    });
    eventBus.emit(RendererEvents.ToggleScaleToFit);
  }, 100, {
    leading: true
  })

  renderZoomButton() {
    if (this.state.isScaledToFit) {
      return <ZoomButton />;
    }
    return <ZoomButton2 />;
  }

  render() {
    return (
      <div className="ani-header">
        <div className="ani-big-heading noselect">
          2019 年 1 月 30 日
        </div>
        <div className="ani-header-button-group">
          <SearchBox />
          <Slider />
          <button
            className="ani-button ani-scale-to-fit-button"
            onClick={this.onScaleToButtonClick}
          >
            {this.renderZoomButton()}
          </button>
        </div>
      </div>
    );
  }

}

export default Header;
