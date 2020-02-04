import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Sidebar from 'renderer/Sidebar';
import GridView from 'renderer/GridView';
import ImageViewer from 'renderer/ImageViewer';
import { PageKey } from 'renderer/pageKey';
import Modals from 'renderer/Modals';
import { eventBus, RendererEvents } from 'renderer/events';
import { Header, SearchHeader} from 'renderer/Header';
import { GlobalStyles, AppContainer, CentralArea, MainContentContainer } from './styles';
import ImportButton from 'renderer/components/ImportButton';

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
      return <SearchHeader />
    }
    return <Header pageKey={pageKey} />;
  }

  private renderMainContent() {
    const { pageKey } = this.state;
    if (pageKey === PageKey.MyPhotos) {
      return null;
    }

    return (
      <MainContentContainer>
        <ImportButton textContent="Add images from My Photos to Album..." />
      </MainContentContainer>
    );
  }

  render() {
    const { pageKey } = this.state;
    return (
      <AppContainer>
        <GlobalStyles />
        <Sidebar pageKey={pageKey} />
        <CentralArea>
          {this.renderHeader()} 
          <GridView key={PageKey.MyPhotos} show={pageKey === PageKey.MyPhotos} />
          {this.renderMainContent()}
        </CentralArea>
        <ImageViewer />
        <Modals />
      </AppContainer>
    );
  }

}

ReactDOM.render(<App />, document.getElementById('app'));
