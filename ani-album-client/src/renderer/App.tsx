import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Sidebar from 'renderer/Sidebar';
import MyPhotosPage from 'renderer/MyPhotosPage';
import ImageViewer from 'renderer/ImageViewer';
import { PageKey, isAAlbum, isAWorkspace } from 'renderer/pageKey';
import AlbumContentPage from 'renderer/AlbumContentPage';
import WorkspaceContentPage from 'renderer/WorkspaceContentPage';
import Modals from 'renderer/Modals';
import { eventBus, RendererEvents } from 'renderer/events';
import { Header, SearchHeader} from 'renderer/Header';
import { GlobalStyles, AppContainer, CentralArea } from './styles';

interface AppState {
  prevPageKey: string;
  pageKey: string;
}

class App extends Component<{}, AppState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      prevPageKey: PageKey.MyPhotos,
      pageKey: PageKey.MyPhotos,
    };
  }

  componentDidMount() {
    eventBus.addListener(RendererEvents.NavigatePage, this.handleNavigatePage);
    eventBus.addListener(RendererEvents.NavigateToPrevPage, this.handleNavigateToPrevPage);
  }

  componentWillUnmount() {
    eventBus.removeListener(RendererEvents.NavigatePage, this.handleNavigatePage);
    eventBus.removeListener(RendererEvents.NavigateToPrevPage, this.handleNavigateToPrevPage);
  }

  private handleNavigateToPrevPage = () => {
    eventBus.emit(RendererEvents.NavigatePage, this.state.prevPageKey);
  }

  private handleNavigatePage = (pageKey: PageKey) => {
    if (pageKey === this.state.pageKey) {
      return;
    }
    this.setState({
      prevPageKey: this.state.pageKey,
      pageKey,
    });
  }

  private renderHeader() {
    const { pageKey } = this.state;
    if (pageKey === PageKey.Search) {
      return <SearchHeader />;
    }
    return <Header pageKey={pageKey} />;
  }

  private renderMainContent() {
    const { pageKey } = this.state;

    if (isAAlbum(pageKey)) {
      return <AlbumContentPage pageKey={pageKey} />;
    } else if (isAWorkspace(pageKey)) {
      return <WorkspaceContentPage pageKey={pageKey} />;
    }

    return null;
  }

  render() {
    const { pageKey } = this.state;
    return (
      <AppContainer>
        <GlobalStyles />
        <Sidebar pageKey={pageKey} />
        <CentralArea>
          {this.renderHeader()} 
          <MyPhotosPage key={PageKey.MyPhotos} show={pageKey === PageKey.MyPhotos} />
          {this.renderMainContent()}
        </CentralArea>
        <ImageViewer />
        <Modals />
      </AppContainer>
    );
  }

}

ReactDOM.render(<App />, document.getElementById('app'));
