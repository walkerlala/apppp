import * as React from 'react';
import { eventBus, RendererEvents } from 'renderer/events';
import { ModalTypes } from './modalTypes';
import NewAlbumModal from './NewAlbumModal';
import './Modals.scss';

interface ModalsState {
  currentModalType: ModalTypes | undefined
}

class Modals extends React.Component<{}, ModalsState> {

  private __params: any[] = [];

  constructor(props: {}) {
    super(props);
    this.state = {
      currentModalType: undefined,
    };
  }

  componentDidMount() {
    eventBus.addListener(RendererEvents.ShowModal, this.handleShow);
    eventBus.addListener(RendererEvents.CloseModal, this.handleClose);
  }

  componentWillUnmount() {
    eventBus.removeListener(RendererEvents.ShowModal, this.handleShow);
    eventBus.removeListener(RendererEvents.CloseModal, this.handleClose);
  }

  private handleShow = (type: ModalTypes, ...params: any[]) => {
    console.log(type);
    this.__params = params;
    this.setState({
      currentModalType: type,
    });
  }

  private handleClose = () => {
    this.__params = [];
    this.setState({
      currentModalType: undefined, 
    });
  }

  renderModal() {
    switch (this.state.currentModalType) {
      case ModalTypes.NewAlbum:
        return <NewAlbumModal />

      default:
        return <React.Fragment />;

    }
  }

  render() {
    return (
      <div className="ani-modals">
        {this.renderModal()}
      </div>
    )
  }

}

export default Modals;
