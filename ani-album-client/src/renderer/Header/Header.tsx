import * as React from 'react';
import ZoomButton from './zoomButton.svg';
import Slider from 'renderer/Slider';
import SearchBox from 'renderer/SearchBox';
import { eventBus, RendererEvents } from 'renderer/events';
import { debounce } from 'lodash';
import './Header.scss';

class Header extends React.Component {

  onScaleToButtonClick = debounce((e: React.MouseEvent) => {
    eventBus.emit(RendererEvents.ToggleScaleToFit);
  }, 100, {
    leading: true
  })

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
            <ZoomButton />
          </button>
        </div>
      </div>
    );
  }

}

export default Header;
