import * as React from 'react';
import ZoomButton from './zoomButton.svg';
import ZoomButton2 from './zoomButton2.svg';
import Slider from 'renderer/Slider';
import { SearchBox } from 'renderer/Search';
import { eventBus, RendererEvents } from 'renderer/events';
import { debounce } from 'lodash';
import { PageKey, isAAlbum, getAlbumToken, isAWorkspace, getWorkspaceToken } from 'renderer/pageKey';
import { Album } from 'common/album';
import { Workspace } from 'common/workspace';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import EditableTitle from './EditableTitle';
import Button from 'renderer/components/Button';
import { HeaderContainer, HeaderButtonGroup, EditableTitleContainer } from './styles';
import { isUndefined } from 'lodash';

interface HeaderProps {
  pageKey: string;
}

interface HeaderState {
  isScaledToFit: boolean;
  isMouseEntered: boolean;
  albumData: Album | null;
  workspaceData: Workspace | null;
}

class Header extends React.Component<HeaderProps, HeaderState> {

  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      isScaledToFit: true,
      isMouseEntered: false,
      albumData: null,
      workspaceData: null,
    };
  }

  componentDidMount() {
    eventBus.addListener(RendererEvents.NavigatePage, this.handlePageNavigation);

    const { pageKey } = this.props;
    if (isAAlbum(pageKey)) {
      this.fetchAlbumData(Number(getAlbumToken(pageKey)));
    } else if (isAWorkspace(pageKey)) {
      this.fetchWorkspaceData(Number(getWorkspaceToken(pageKey)));
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
    if (isAAlbum(pageKey)) {
      this.fetchAlbumData(Number(getAlbumToken(pageKey)));
    } else if (isAWorkspace(pageKey)) {
      this.fetchWorkspaceData(Number(getWorkspaceToken(pageKey)));
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

  private async fetchWorkspaceData(wpId: number) {
    try {
      const wpData = await ipcRenderer.invoke(ClientMessageType.GetWorkspaceById, wpId);
      if (isUndefined(wpData)) {
        return;
      }
      this.setState({
        workspaceData: wpData,
      });
    } catch (err) {
      console.error(err);
    }
  }

  private handleTitleContentChanged = async (content: string) => {
    if (isAAlbum(this.props.pageKey)) {
      if (!this.state.albumData) {
        return;
      }
      try {
        const albumData: Album = {
          ...this.state.albumData,
          name: content,
        };
        await ipcRenderer.invoke(ClientMessageType.UpdateAlbumById, albumData);
        this.setState({
          albumData,
        });
        eventBus.emit(RendererEvents.AlbumInfoUpdated, albumData.id);
      } catch (err) {
        console.error(err);
      }
    } else if (isAWorkspace(this.props.pageKey)) {
      if (!this.state.workspaceData) {
        return;
      }
      const wpData: Workspace = {
        ...this.state.workspaceData,
        name: content,
      };
      await ipcRenderer.invoke(ClientMessageType.UpdateWorkspaceById, wpData);
      this.setState({
        workspaceData: wpData,
      });
    }
  }

  private renderBidHeaderContent() {
    const { pageKey } = this.props;
    const { albumData, isMouseEntered, workspaceData } = this.state;
    let content = '2019 年 1 月 30 日';
    let canEdit: boolean = false;

    if (pageKey === PageKey.Albums) {
      content = 'Albums';
    } else if (isAAlbum(pageKey)) {
      if (albumData) {
        canEdit = true;
        content = albumData.name;
      } else {
        content = '';
      }
    } else if (isAWorkspace(pageKey)) {
      if (workspaceData) {
        canEdit = true;
        content = workspaceData.name;
      } else {
        content = '';
      }
    }

    return (
      <EditableTitleContainer>
        <EditableTitle
          key={pageKey} // remount if pageKey is different
          canEdit={canEdit}
          showEditButton={isMouseEntered}
          defaultContent={content}
          onConfirmChange={this.handleTitleContentChanged}
        />
      </EditableTitleContainer>
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
      <HeaderContainer
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {this.renderBidHeaderContent()}
        <HeaderButtonGroup>
          <SearchBox
            style={{
              marginRight: '36px',
            }}
            onClick={this.searchBoxClicked}
          />
          <Slider />
          <Button
            className="ani-button"
            size="large"
            onClick={this.onScaleToButtonClick}
            style={{
              marginLeft: '12px',
            }}
          >
            {this.renderZoomButton()}
          </Button>
        </HeaderButtonGroup>
      </HeaderContainer>
    );
  }

}

export default Header;
