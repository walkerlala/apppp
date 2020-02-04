import * as React from 'react';
import Modal from 'renderer/components/Modal';
import { GridContainer } from './styles';

export interface ImportPhotosToAlbumModalProps {
  params?: any[];
  onClose: () => void;
}

class ImportPhotosToAlbumModal extends React.Component<ImportPhotosToAlbumModalProps> {

  static defaultProps: Partial<ImportPhotosToAlbumModalProps> = {
    params: [],
  };

  private handleConfirm = () => {
    // send message
    this.props.onClose();
  }

  render() {
    const { onClose } = this.props;
    return (
      <Modal onClose={onClose} onConfirm={this.handleConfirm}>
        <GridContainer>
          Hello
        </GridContainer>
      </Modal>
    )
  }

}

export default ImportPhotosToAlbumModal;
