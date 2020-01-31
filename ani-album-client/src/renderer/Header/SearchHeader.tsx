import * as React from 'react';
import { SearchInput } from 'renderer/Search';
import { eventBus, RendererEvents } from 'renderer/events';
import Button from 'renderer/components/Button';
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
        <Button
          className="ani-no-drag"
          onClick={this.handleCloseClicked}
          size="large"
        >
          Close
        </Button>
      </SearchHeaderContainer>
    );
  }

}

export default SearchHeader;
