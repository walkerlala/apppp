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
import { isUndefined } from 'lodash';

import './Header.scss';

interface HeaderProps {
  pageKey: string;
}

interface HeaderState {
  isScaledToFit: boolean;
  albumData: Album | null;
}

class Header extends React.Component<HeaderProps, HeaderState> {

  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      isScaledToFit: true,
      albumData: null,
    };
  }

  onScaleToButtonClick = debounce((e: React.MouseEvent) => {
    this.setState({
      isScaledToFit: !this.state.isScaledToFit,
    });
    eventBus.emit(RendererEvents.ToggleScaleToFit);
  }, 100, {
    leading: true
  })

  renderZoomButton() {
    if (this.state.isScaledToFit) {
      return <ZoomButton />;
    }
    return <ZoomButton2 />;
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

  private renderBidHeaderContent() {
    const { pageKey } = this.props;
    const { albumData } = this.state;
    let content = '2019 年 1 月 30 日';

    if (pageKey === PageKey.Albums) {
      content = 'Albums';
    } else if (pageKey.startsWith('Album-')) {
      const suffix = pageKey.slice('Album-'.length);
      this.fetchAlbumData(Number(suffix));
      if (albumData) {
        content = albumData.name;
      } else {
        content = 'Albums';
      }
    }

    return (
      <div className="ani-big-heading noselect">
        {content}
      </div>
    );
  }

  render() {
    return (
      <div className="ani-header">
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
