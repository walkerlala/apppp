import * as React from 'react';
import { SearchInput } from 'renderer/Search';
import { eventBus, RendererEvents } from 'renderer/events'
import { SearchHeaderContainer, SearchInputContainer, SearchCloseButton } from './styles';

class SearchHeader extends React.Component {

  private handleCloseClicked = (e: React.MouseEvent) => {
    eventBus.emit(RendererEvents.NavigateToPrevPage);
  }

  render() {
    return (
      <SearchHeaderContainer>
        <SearchInputContainer>
          <SearchInput />
        </SearchInputContainer>
        <SearchCloseButton className="ani-button noselect" onClick={this.handleCloseClicked} >
          Close
        </SearchCloseButton>
      </SearchHeaderContainer>
    )
  }

}

export default SearchHeader;
