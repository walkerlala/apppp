import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { isUndefined } from 'lodash';

export interface IMaskProps {
  children?: any;
  onMaskClick?: (e: React.MouseEvent) => void;
}

class Mask extends React.Component<IMaskProps> {

  private __maskRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

  constructor(props: IMaskProps) {
    super(props);
  }

  private handleMaskClicked = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== this.__maskRef.current) {
      return;
    }

    const { onMaskClick } = this.props;

    if (!isUndefined(onMaskClick)) {
      onMaskClick(e);
    }
  }

  private renderMaskContent() {
    const { children } = this.props
    return (
      <div
        className="ani-modal-mask"
        onClick={this.handleMaskClicked}
        ref={this.__maskRef}
      >
        {children}
      </div>
    );
  }

  render() {
    return ReactDOM.createPortal(
      this.renderMaskContent(),
      document.querySelector('#app-modal'),
    );
  }
  
}

export default Mask;
