import * as React from 'react';
import SearchLogo from '../SearchLogo.svg';
import Button from 'renderer/components/Button';
import { LogoContainer, Text } from './styles';

export interface ISearchBoxProps {
  onClick?: (e: React.MouseEvent) => void,
  style?: React.CSSProperties,
}

class SearchBox extends React.PureComponent<ISearchBoxProps> {

  render() {
    return (
      <Button
        className="ani-no-drag"
        onClick={this.props.onClick}
        style={this.props.style}
        size="large"
      >
        <LogoContainer>
          <SearchLogo />
        </LogoContainer>
        <Text className="noselect">Search images...</Text>
      </Button>
    );
  }

}

export default SearchBox;
