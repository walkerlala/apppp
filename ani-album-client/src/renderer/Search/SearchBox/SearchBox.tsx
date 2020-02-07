import * as React from 'react';
import SearchLogo from '../SearchLogo.svg';
import Button from 'renderer/components/Button';
import Tooltip from 'renderer/components/Tooltip';

export interface ISearchBoxProps {
  onClick?: (e: React.MouseEvent) => void,
  style?: React.CSSProperties,
}

class SearchBox extends React.PureComponent<ISearchBoxProps> {

  render() {
    return (
      <Tooltip
        content="Search images"
        position="bottom"
      >
        <Button
          className="ani-no-drag"
          onClick={this.props.onClick}
          style={this.props.style}
          size="large"
        >
          <SearchLogo />
        </Button>
      </Tooltip>
    );
  }

}

export default SearchBox;
