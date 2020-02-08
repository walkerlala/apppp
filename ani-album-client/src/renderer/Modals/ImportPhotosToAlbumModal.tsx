import * as React from 'react';
import Modal from 'renderer/components/Modal';
import GridView from 'renderer/components/GridView';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import { getAlbumToken, isAAlbum, isAWorkspace, getWorkspaceToken } from 'renderer/pageKey';
import { GridContainer } from './styles';
import { eventBus, RendererEvents } from 'renderer/events';

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
    let hasSuccess = false;
    const ids = [...this.state.selectedIds];
    if (isAAlbum(pageKey)) {
      const albumId = Number(getAlbumToken(pageKey));

      for (const id of ids) {
        try {
          await ipcRenderer.invoke(ClientMessageType.AddImageToAlbum, id, albumId);
          hasSuccess = true;
        } catch (err) {
          console.error(err);
        }
      }
      if (hasSuccess) {
        eventBus.emit(RendererEvents.AlbumContentUpdated, albumId);
      }
    } else if (isAWorkspace(pageKey)) {
      const workspaceId = Number(getWorkspaceToken(pageKey));
      for (const id of ids) {
        try {
          await ipcRenderer.invoke(ClientMessageType.AddImageToWorkspace, id, workspaceId);
          hasSuccess = true;
        } catch (err) {
          console.error(err);
        }
      }
      if (hasSuccess) {
        eventBus.emit(RendererEvents.WorkspaceContentUpated, workspaceId);
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
