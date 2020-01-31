import * as React from 'react';
import SearchLogo from '../SearchLogo.svg';
import { SearchInputContainer, LogoContainer, Input } from './styled';

export interface SearchInputProps {
  autoFocus?: boolean;
}

class SearchInput extends React.Component<SearchInputProps> {

  static defaultProps = {
    autoFocus: true,
  }

  private __inputRef: React.RefObject<HTMLInputElement> = React.createRef();

  componentDidMount() {
    if (this.props.autoFocus) {
      this.__inputRef.current.focus();
    }
  }
  
  render() {
    return (
      <SearchInputContainer className="ani-no-drag">
        <LogoContainer>
          <SearchLogo />
        </LogoContainer>
        <Input ref={this.__inputRef} placeholder="Search images..." />
      </SearchInputContainer>
    );
  }

}

export default SearchInput;
