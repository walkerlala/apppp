import * as React from 'react';
import { action, runInAction } from 'mobx';
import { observer, inject } from 'mobx-react';
import { ViewData } from 'renderer/data/viewData';
import { TreeData, TreeItem } from 'renderer/data/tree';
import Slider from 'renderer/Slider';
import { SearchBox } from 'renderer/Search';
import { eventBus, RendererEvents } from 'renderer/events';
import { debounce } from 'lodash';
import { PageKey, isAAlbum, isAWorkspace, getWorkspaceToken, WorkspacePrefix } from 'renderer/pageKey';
import { Album } from 'common/album';
import { Workspace } from 'common/workspace';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import EditableTitle from './EditableTitle';
import Button from 'renderer/components/Button';
import Popup from 'renderer/components/Popup';
import Menu, { MenuItem } from 'renderer/components/Menu';
import { HeaderContainer, HeaderButtonGroup, EditableTitleContainer } from './styles';
import { isUndefined } from 'lodash';

import Tooltip from 'renderer/components/Tooltip';

import AddButtonIcon from './addButton.svg';
import ZoomButton from './zoomButton.svg';
import ZoomButton2 from './zoomButton2.svg';
import SmartClassifyButton from './SmartClassifyButton.svg';
import { ModalTypes } from 'renderer/Modals';

interface HeaderProps {
  pageKey: string;
  viewDataStore?: ViewData;
  treeStore?: TreeData;
}

interface HeaderState {
  isMouseEntered: boolean;
  addButtonOpen: boolean;
}

@inject('viewDataStore', 'treeStore')
@observer
class Header extends React.Component<HeaderProps, HeaderState> {

  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      isMouseEntered: false,
      addButtonOpen: false,
    };
  }

  onScaleToButtonClick = debounce(action((e: React.MouseEvent) => {
    const { viewDataStore } = this.props;
    viewDataStore.scaleToFit = !viewDataStore.scaleToFit
  }), 100, {
    leading: true,
  })

  renderZoomButton() {
    const { viewDataStore } = this.props;
    if (viewDataStore.scaleToFit) {
      return <ZoomButton />;
    }
    return <ZoomButton2 />;
  }

  private searchBoxClicked = (e: React.MouseEvent) => {
    eventBus.emit(RendererEvents.NavigatePage, PageKey.Search);
  }

  private handleTitleContentChanged = async (content: string) => {
    const { treeStore } = this.props;
    if (isAAlbum(this.props.pageKey)) {
      const treeItem: TreeItem | undefined = treeStore.dataMap.get(this.props.pageKey);
      if (isUndefined(treeItem)) {
        return;
      }
      try {
        const albumData: Album = {
          ...treeItem.album,
          name: content,
        };
        await ipcRenderer.invoke(ClientMessageType.UpdateAlbumById, albumData);
        runInAction(() => {
          treeItem.label = content;
          treeItem.album = albumData;
        });
        // this.setState({
        //   albumData,
        // });
        // eventBus.emit(RendererEvents.AlbumInfoUpdated, albumData.id);
      } catch (err) {
        console.error(err);
      }
    } else if (isAWorkspace(this.props.pageKey)) {
      const treeItem: TreeItem | undefined = treeStore.dataMap.get(this.props.pageKey);
      if (isUndefined(treeItem)) {
        return;
      }
      const wpData: Workspace = {
        ...treeItem.workspace,
        name: content,
      };
      await ipcRenderer.invoke(ClientMessageType.UpdateWorkspaceById, wpData);
      runInAction(() => {
        treeItem.label = wpData.name;
        treeItem.workspace = wpData;
      });
      // this.setState({
      //   workspaceData: wpData,
      // });
      // eventBus.emit(RendererEvents.WorkspaceInfoUpdated, wpData.id);
    }
  }

  private renderBidHeaderContent() {
    const { pageKey, treeStore } = this.props;
    const { isMouseEntered } = this.state;
    let content = '2019 年 1 月 30 日';
    let canEdit: boolean = false;

    if (pageKey === PageKey.Albums) {
      content = 'Albums';
    } else if (isAAlbum(pageKey)) {
      const treeItem: TreeItem | undefined = treeStore.dataMap.get(pageKey);
      if (isUndefined(treeItem)) {
        content = '';
      } else if (isUndefined(treeItem.album)) {
        content = 'Album';
      } else {
        canEdit = true;
        content = treeItem.album.name;
      }
    } else if (isAWorkspace(pageKey)) {
      const treeItem: TreeItem | undefined = treeStore.dataMap.get(pageKey);
      if (isUndefined(treeItem)) {
        content = '';
      } else if (isUndefined(treeItem.workspace)) {
        content = 'Workspace';
      } else {
        canEdit = true;
        content = treeItem.workspace.name;
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

  private renderSmartClassifyButton() {
    if (!isAWorkspace(this.props.pageKey)) {
      return null;
    }
    return (
      <Tooltip
        content="Smart Classify"
        position="bottom"
      >
        <Button size="large" style={{
          marginLeft: '8px',
        }}>
          <SmartClassifyButton />
        </Button>

      </Tooltip>
    );
  }

  private renderSlider() {
    const { pageKey } = this.props;
    if (isAWorkspace(pageKey)) {
      return null;
    }
    return (
      <Slider
        style={{ marginRight: '24px' }}
      />
    );
  }

  private handleAddImageMenuClicked = () => {
    this.setState({ addButtonOpen: false });

    eventBus.emit(RendererEvents.ShowModal, ModalTypes.ImportPhotosToAlbum, this.props.pageKey);
  }

  private handleAddWorkspaceMenuClicked = async () => {
    this.setState({ addButtonOpen: false });
    const parentToken = Number(getWorkspaceToken(this.props.pageKey));
    try {
      const data: Workspace = await ipcRenderer.invoke(ClientMessageType.CreateWorkspace, parentToken);

      await this.props.treeStore.fetchWorkspaces(this.props.pageKey);

      eventBus.emit(RendererEvents.NavigatePage, WorkspacePrefix + data.id.toString());
    } catch (err) {
      console.error(err);
    }
  }

  private renderAddMenu = () => {
    return (
      <React.Fragment>
        <MenuItem onClick={this.handleAddImageMenuClicked}>Images</MenuItem>
        <MenuItem onClick={this.handleAddWorkspaceMenuClicked}>Workspaces</MenuItem>
      </React.Fragment>
    );
  }

  private renderAddButton() {
    const { addButtonOpen } = this.state;
    const { pageKey } = this.props;
    if (!isAWorkspace(pageKey)) {
      return null;
    }
    return (
      <Popup
        popupComponent={Menu as any}
        isOpen={addButtonOpen}
        content={this.renderAddMenu}
        onClose={() => this.setState({ addButtonOpen: false })}
        trigger={({ ref, ...rest}) => {
          return (
            <Button
              onClick={() => this.setState({ addButtonOpen: true })}
              size="large"
              ref={ref as React.Ref<HTMLButtonElement>}
              {...rest}
            >
              <AddButtonIcon />
            </Button>
          );
        }}
        placement="bottom"
      />
    );
  }

  render() {
    return (
      <HeaderContainer
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {this.renderBidHeaderContent()}
        <HeaderButtonGroup>
          {this.renderSlider()}
          {this.renderAddButton()}
          <SearchBox onClick={this.searchBoxClicked} />
          {this.renderSmartClassifyButton()}
          <Tooltip
            position="bottom"
            content="Show thumbnai as square or in full aspect ratio"
          >
            <Button
              className="ani-button"
              size="large"
              onClick={this.onScaleToButtonClick}
            >
              {this.renderZoomButton()}
            </Button>
          </Tooltip>
        </HeaderButtonGroup>
      </HeaderContainer>
    );
  }

}

export default Header;
