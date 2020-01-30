import * as React from 'react';
import { SearchInput } from 'renderer/Search';
import { eventBus, RendererEvents } from 'renderer/events'
import './SearchHeader.scss';

class SearchHeader extends React.Component {

  private handleCloseClicked = (e: React.MouseEvent) => {
    eventBus.emit(RendererEvents.NavigateToPrevPage);
  }

  render() {
    return (
      <div className="ani-header ani-header-search">
        <div className="ani-search-input-container">
          <SearchInput />
        </div>
        <button
          className="ani-button ani-search-close-button noselect"
          onClick={this.handleCloseClicked}
        >
          Close
        </button>
      </div>
    )
  }

}

export default SearchHeader;
