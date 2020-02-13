import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Sidebar from 'renderer/Sidebar';
import MyPhotosPage from 'renderer/MyPhotosPage';
import ImageViewer from 'renderer/ImageViewer';
import { PageKey, isAAlbum, isAWorkspace } from 'renderer/pageKey';
import AlbumContentPage from 'renderer/AlbumContentPage';
import AlbumSummayPage from 'renderer/AlbumSummaryPage';
import WorkspaceContentPage from 'renderer/WorkspaceContentPage';
import Modals from 'renderer/Modals';
import { eventBus, RendererEvents } from 'renderer/events';
import { Header, SearchHeader} from 'renderer/Header';
import { treeStore, viewDataStore } from 'renderer/data';
import { GlobalStyles, AppContainer, CentralArea } from './styles';

configure({ enforceActions: "observed" });

interface AppState {
  pageKey: string;
  pageKeyHistory: string[];
}

const MaxStackOfPageHistory = 12;

class App extends Component<{}, AppState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      pageKey: PageKey.MyPhotos,
      pageKeyHistory: [],
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
    const { pageKeyHistory } = this.state;
    if (pageKeyHistory.length <= 0) return;
    const pageKey = pageKeyHistory[pageKeyHistory.length - 1];
    this.setState({
      pageKeyHistory: pageKeyHistory.slice(0, pageKeyHistory.length - 1),
      pageKey,
    });
    eventBus.emit(RendererEvents.NavigatePage, pageKey, true);
  }

  private handleNavigatePage = (pageKey: PageKey, noUpdate?: boolean) => {
    if (noUpdate) {
      return;
    }
    if (pageKey === this.state.pageKey) {
      return;
    }
    let pageKeyHistory = [...this.state.pageKeyHistory, this.state.pageKey];

    if (pageKeyHistory.length > MaxStackOfPageHistory) {
      pageKeyHistory = pageKeyHistory.slice(pageKeyHistory.length - MaxStackOfPageHistory);
    }

    this.setState({
      pageKeyHistory,
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

    if (pageKey === PageKey.Albums) {
      return <AlbumSummayPage pageKey={pageKey} />
    } else if (isAAlbum(pageKey)) {
      return <AlbumContentPage pageKey={pageKey} />;
    } else if (isAWorkspace(pageKey)) {
      return <WorkspaceContentPage pageKey={pageKey} />;
    }

    return null;
  }

  render() {
    const { pageKey } = this.state;
    return (
      <Provider
        treeStore={treeStore}
        viewDataStore={viewDataStore}
      >
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
      </Provider>
    );
  }

}

ReactDOM.render(<App />, document.getElementById('app'));
