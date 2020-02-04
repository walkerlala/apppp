import * as React from 'react';
import Modal from 'renderer/components/Modal';
import GridView from 'renderer/components/GridView';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import { getAlbumToken } from 'renderer/pageKey';
import { GridContainer } from './styles';

export interface ImportPhotosToAlbumModalProps {
  params?: any[];
  onClose: () => void;
}

interface State {
  selectedIds: Set<number>;
}

class ImportPhotosToAlbumModal extends React.Component<ImportPhotosToAlbumModalProps, State> {

  constructor(props: ImportPhotosToAlbumModalProps) {
    super(props);
    this.state = {
      selectedIds: new Set(),
    };
  }

  static defaultProps: Partial<ImportPhotosToAlbumModalProps> = {
    params: [],
  };

  private handleConfirm = async () => {
    // send message
    this.props.onClose();
    if (this.props.params.length < 1) {
      console.error('no pageKey');
      return;
    }

    const pageKey = this.props.params[0];
    const albumId = Number(getAlbumToken(pageKey));

    const ids = [...this.state.selectedIds];
    for (const id of ids) {
      try {
        await ipcRenderer.invoke(ClientMessageType.AddImageToAlbum, id, albumId);
      } catch (err) {
        console.error(err);
      }
    }
  }

  private handleSelectedIdsUpdate = (newSet: Set<number>) => {
    this.setState({
      selectedIds: newSet,
    });
  }

  render() {
    const { onClose } = this.props;
    const { selectedIds } = this.state;
    return (
      <Modal onClose={onClose} onConfirm={this.handleConfirm}>
        <GridContainer>
          <GridView selectedIds={selectedIds} onSelectedIdsChanged={this.handleSelectedIdsUpdate} />
        </GridContainer>
      </Modal>
    );
  }

}

export default ImportPhotosToAlbumModal;
