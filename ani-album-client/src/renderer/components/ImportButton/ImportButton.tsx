import * as React from 'react';
import ImportIcon from './import.svg';
import './ImportButton.scss';

export interface ImportButtonProps {
  textContent: string;
  onClick?: (e: React.MouseEvent) => void;
}

class ImportButton extends React.PureComponent<ImportButtonProps> {

  render() {
    const { textContent, onClick } = this.props;
    return (
      <div className="ani-import-button">
        <div className="ani-import-button-icon-container" onClick={onClick}>
          <ImportIcon />
        </div>
        <div className="ani-import-button-text-content noselect">
          {textContent}
        </div>
      </div>
    );
  }

}

export default ImportButton;
