import * as React from 'react';
import { Album } from 'common/album';
import { ImageWithThumbnails } from 'common/image';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import PhotosCollectionItem from 'renderer/components/PhotosCollectionItem';

export interface AlbumItemProps {
  data: Album;
  onClick?: (id: number) => void;
}

interface State {
  images: ImageWithThumbnails[];
}

class AlbumItem extends React.Component<AlbumItemProps, State> {

  constructor(props: AlbumItemProps) {
    super(props);
    this.state = {
      images: [],
    };
  }

  componentDidMount() {
    this.fetchThumbnails();
  }

  private async fetchThumbnails() {
    try {
      const { id } = this.props.data;
      const images: ImageWithThumbnails[] = await ipcRenderer.invoke(ClientMessageType.GetImagesByAlbumId, id);
      this.setState({ images });
    } catch (err) {
      console.error(err);
    }
  }

  private handleClicked = (e: React.MouseEvent) => {
    if (!this.props.onClick) return;
    this.props.onClick(this.props.data.id);
  }

  private handleContextMenu = async (e: React.MouseEvent) => {
    // const { data } = this.props;
    // const workspaceId = data.id;
    // await ipcRenderer.invoke(ClientMessageType.ShowContextMenu, ContextMenuType.WorkspaceItem, {
    //   workspaceId,
    // });
  }

  render() {
    const { name } = this.props.data;
    const { images } = this.state;

    return (
      <PhotosCollectionItem
        name={name}
        images={images}
        onClick={this.handleClicked}
        onContextMenu={this.handleContextMenu}
      />
    );
  }
  
}

export default AlbumItem;
