import * as React from 'react';
import ZoomButton from './zoomButton.svg';
import ZoomButton2 from './zoomButton2.svg';
import Slider from 'renderer/Slider';
import { SearchBox } from 'renderer/Search';
import { eventBus, RendererEvents } from 'renderer/events';
import { debounce } from 'lodash';
import { PageKey } from 'renderer/pageKey';
import { Album } from 'common/album';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import EditableTitle from './EditableTitle';
import { isUndefined } from 'lodash';

import './Header.scss';

interface HeaderProps {
  pageKey: string;
}

interface HeaderState {
  isScaledToFit: boolean;
  isMouseEntered: boolean;
  albumData: Album | null;
}

class Header extends React.Component<HeaderProps, HeaderState> {

  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      isScaledToFit: true,
      isMouseEntered: false,
      albumData: null,
    };
  }

  componentDidMount() {
    eventBus.addListener(RendererEvents.NavigatePage, this.handlePageNavigation);

    if (this.props.pageKey.startsWith('Album-')) {
      const suffix = this.props.pageKey.slice('Album-'.length);
      this.fetchAlbumData(Number(suffix));
    }
  }

  componentWillUnmount() {
    eventBus.removeListener(RendererEvents.NavigatePage, this.handlePageNavigation);
  }

  onScaleToButtonClick = debounce((e: React.MouseEvent) => {
    this.setState({
      isScaledToFit: !this.state.isScaledToFit,
    });
    eventBus.emit(RendererEvents.ToggleScaleToFit);
  }, 100, {
    leading: true,
  })

  renderZoomButton() {
    if (this.state.isScaledToFit) {
      return <ZoomButton />;
    }
    return <ZoomButton2 />;
  }

  private handlePageNavigation = (pageKey: string) => {
    if (pageKey.startsWith('Album-')) {
      const suffix = pageKey.slice('Album-'.length);
      this.fetchAlbumData(Number(suffix));
    }
  }

  private searchBoxClicked = (e: React.MouseEvent) => {
    eventBus.emit(RendererEvents.NavigatePage, PageKey.Search);
  }

  private async fetchAlbumData(albumId: number) {
    try {
      const albumData = await ipcRenderer.invoke(ClientMessageType.GetAlbumById, albumId);
      if (isUndefined(albumData)) {
        return;
      }
      this.setState({
        albumData,
      });
    } catch (err) {
      console.error(err);
    }
  }

  private handleTitleContentChanged = async (content: string) => {
    if (!this.state.albumData) {
      return;
    }
    const albumData = {
      ...this.state.albumData,
      name: content,
    }
    this.setState({
      albumData,
    });
    try {
      await ipcRenderer.invoke(ClientMessageType.UpdateAlbumById, albumData);
      eventBus.emit(RendererEvents.AlbumInfoUpdated, albumData.id);
    } catch (err) {
      console.error(err);
    }
  }

  private renderBidHeaderContent() {
    const { pageKey } = this.props;
    const { albumData, isMouseEntered } = this.state;
    let content = '2019 年 1 月 30 日';
    let canEdit: boolean = false;

    if (pageKey === PageKey.Albums) {
      content = 'Albums';
    } else if (pageKey.startsWith('Album-')) {
      if (albumData) {
        canEdit = true;
        content = albumData.name;
      } else {
        content = '';
      }
    }

    return (
      <div className="ani-editable-title-container">
        <EditableTitle
          key={pageKey} // remount if pageKey is different
          canEdit={canEdit}
          showEditButton={isMouseEntered}
          defaultContent={content}
          onConfirmChange={this.handleTitleContentChanged}
        />
      </div>
    );
  }

  private handleMouseEnter = (e: React.MouseEvent) => {
    this.setState({
      isMouseEntered: true,
    });
  }

  private handleMouseLeave = (e: React.MouseEvent) => {
    this.setState({
      isMouseEntered: false,
    });
  }

  render() {
    return (
      <div
        className="ani-header"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {this.renderBidHeaderContent()}
        <div className="ani-header-button-group">
          <SearchBox onClick={this.searchBoxClicked} />
          <Slider />
          <button
            className="ani-button ani-scale-to-fit-button"
            onClick={this.onScaleToButtonClick}
          >
            {this.renderZoomButton()}
          </button>
        </div>
      </div>
    );
  }

}

export default Header;
