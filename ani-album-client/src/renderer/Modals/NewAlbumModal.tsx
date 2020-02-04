import * as React from 'react';
import Modal from 'renderer/components/Modal';
import { eventBus, RendererEvents } from 'renderer/events';

class NewAlbumModal extends React.Component {

  constructor(props: {}) {
    super(props);
  }

  private handleClose = () => {
    eventBus.emit(RendererEvents.CloseModal);
  }

  render() {
    return (
      <Modal
        onClose={this.handleClose}
      >
        Hello
      </Modal>
    )
  }

}

export default NewAlbumModal;
