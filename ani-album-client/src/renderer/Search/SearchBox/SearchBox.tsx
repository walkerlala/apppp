import * as React from 'react';
import SearchLogo from '../SearchLogo.svg';
import './SearchBox.scss';

export interface ISearchBoxProps {
  onClick?: (e: React.MouseEvent) => void,
}

class SearchBox extends React.Component<ISearchBoxProps> {

  render() {
    return (
      <div className="ani-search-box" onClick={this.props.onClick}>
        <div className="ani-logo-container">
          <SearchLogo />
        </div>
        <div className="ani-search-text">Search images...</div>
      </div>
    );
  }

}

export default SearchBox;
