import * as React from 'react';
import ZoomButton from './zoomButton.svg';
import Slider from 'renderer/Slider';
import SearchBox from 'renderer/SearchBox';
import './Header.scss';

class Header extends React.Component {

  render() {
    return (
      <div className="ani-header">
        <div className="ani-header-button-group">
          <SearchBox />
          <Slider />
          <button className="ani-button ani-zoom-button">
            <ZoomButton />
          </button>
        </div>
      </div>
    );
  }

}

export default Header;
