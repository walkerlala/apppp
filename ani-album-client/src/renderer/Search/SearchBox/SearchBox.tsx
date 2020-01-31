import * as React from 'react';
import SearchLogo from '../SearchLogo.svg';
import { Container, LogoContainer, Text } from './styles';

export interface ISearchBoxProps {
  onClick?: (e: React.MouseEvent) => void,
}

class SearchBox extends React.Component<ISearchBoxProps> {

  render() {
    return (
      <Container className="ani-no-drag" onClick={this.props.onClick}>
        <LogoContainer>
          <SearchLogo />
        </LogoContainer>
        <Text className="noselect">Search images...</Text>
      </Container>
    );
  }

}

export default SearchBox;
