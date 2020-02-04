import * as React from 'react';
import Mask from './Mask';
import { isUndefined } from 'lodash';
import Button from 'renderer/components/Button'; 
import './Modal.scss';

export interface ModalProps {
  children?: any;
  onConfirm?: () => void;
  onClose?: () => void;
}

class Modal extends React.Component<ModalProps> {

  private handleConfirmButtonClicked = (e: React.MouseEvent) => {
    const { onConfirm } = this.props;
    if (!isUndefined(onConfirm)) {
      onConfirm();
    }
  }

  private renderChildren() {
    const { children } = this.props
    return (
      <div className="ani-modal">
        {children}
        <div className="ani-modal-footer">
          <Button
            className="ani-modal-footer-confirm"
            onClick={this.handleConfirmButtonClicked}
          >
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  private handleMaskClicked = () => {
    const { onClose } = this.props;

    if (!isUndefined(onClose)) {
      onClose();
    }
  }

  render() {
    return (
      <Mask
        children={this.renderChildren()}
        onMaskClick={this.handleMaskClicked}
      />
    );
  }

}

export default Modal;
