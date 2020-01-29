import * as React from 'react';
import Modal from 'react-modal';
import { eventBus, RendererEvents } from 'renderer/events';
import './NewAlbumModal.scss';

class NewAlbumModal extends React.Component {

  constructor(props: {}) {
    super(props);
    Modal.setAppElement(document.getElementById('app'));
  }

  private handleClose = () => {
    eventBus.emit(RendererEvents.CloseModal);
  }

  render() {
    return (
      <Modal
        isOpen
        onRequestClose={this.handleClose}
        className="ani-modal ani-new-album-modal"
        overlayClassName="ani-modal-overlay"
      >
        Hello
      </Modal>
    )
  }

}

export default NewAlbumModal;
