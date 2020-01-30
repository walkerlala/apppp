import * as React from 'react';
import SearchLogo from './SearchLogo.svg';
import './SearchBox.scss';

class SearchBox extends React.Component {

  render() {
    return (
      <div className="ani-search-box">
        <div className="ani-logo-container">
          <SearchLogo />
        </div>
        <div className="ani-search-input">Search images...</div>
      </div>
    );
  }

}

export default SearchBox;
