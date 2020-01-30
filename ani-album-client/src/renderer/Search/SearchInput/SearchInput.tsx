import * as React from 'react';
import SearchLogo from '../SearchLogo.svg';
import './SearchInput.scss';

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
      <div className="ani-search-input">
        <div className="ani-search-input-logo-container">
          <SearchLogo />
        </div>
        <input ref={this.__inputRef} placeholder="Search images..." />
      </div>
    );
  }

}

export default SearchInput;
