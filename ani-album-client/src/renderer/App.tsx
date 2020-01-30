import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Sidebar from 'renderer/Sidebar';
import GridView from 'renderer/GridView';
import ImageViewer from 'renderer/ImageViewer';
import { PageKey } from 'renderer/pageKey';
import Modals from 'renderer/Modals';
import { eventBus, RendererEvents } from 'renderer/events';
import { Header, SearchHeader} from 'renderer/Header';
import './App.scss';

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
    this.setState({
      prevPageKey: PageKey.MyPhotos,
      pageKey: this.state.prevPageKey,
    });
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
    if (this.state.pageKey === PageKey.Search) {
      return <SearchHeader />
    }
    return <Header />;
  }

  render() {
    const { pageKey } = this.state;
    return (
      <div className="ani-app">
        <Sidebar pageKey={pageKey} />
        <div className="ani-main-content">
          {this.renderHeader()} 
          <GridView key={PageKey.MyPhotos} show={pageKey === PageKey.MyPhotos} />
        </div>
        <ImageViewer />
        <Modals />
      </div>
    );
  }

}

ReactDOM.render(<App />, document.getElementById('app'));
