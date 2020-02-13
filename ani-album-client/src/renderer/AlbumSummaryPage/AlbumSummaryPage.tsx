import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { Container } from './styles';
import { TreeData, TreeItem } from 'renderer/data/tree';
import { PageKey, AlbumPrefix } from 'renderer/pageKey';
import { Album } from 'common/album';
import AlbumItem from './AlbumItem';
import { eventBus, RendererEvents } from 'renderer/events';

export interface AlbumSummaryPageProps {
  pageKey: string;
  treeStore?: TreeData;
}

@inject('treeStore')
@observer
class AlbumSummaryPage extends React.Component<AlbumSummaryPageProps> {

  componentDidMount() {
    const { treeStore } = this.props;

    treeStore.fetchAllAlbums();
  }

  handleClick = (albumId: number) => {
    const pageId = AlbumPrefix + albumId;
    eventBus.emit(RendererEvents.NavigatePage, pageId);
  }

  render() {
    const { treeStore } = this.props;

    const items: TreeItem[] = treeStore.getChildrenByParentId(PageKey.Albums);
    const albums: Album[] = items.map(item => item.album);

    return (
      <Container>
        {albums.map(album => (
          <AlbumItem key={album.id} data={album} onClick={this.handleClick} />
        ))}
      </Container>
    );
  }

}

export default AlbumSummaryPage;
