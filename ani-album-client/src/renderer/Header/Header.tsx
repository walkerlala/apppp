import * as React from 'react';
import ZoomButton from './zoomButton.svg';
import Slider from 'renderer/Slider';
// import Slider, { Range } from 'rc-slider';
import './Header.scss';
import 'rc-slider/assets/index.css';

class Header extends React.Component {

  render() {
    return (
      <div className="ani-header">
        <div className="ani-header-button-group">
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
