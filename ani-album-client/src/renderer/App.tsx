import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Sidebar from 'renderer/Sidebar';
import GridView from 'renderer/GridView';
import ImageViewer from 'renderer/ImageViewer';
import { PageKey } from 'renderer/pageKey';
import { eventBus, RendererEvents } from 'renderer/events';
import './App.scss';

interface AppState {
  pageKey: PageKey;
}

class App extends Component<{}, AppState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      pageKey: PageKey.MyPhotos,
    };
  }

  componentDidMount() {
    eventBus.addListener(RendererEvents.SidebarTreeClicked, this.handleSidebarItemClicked);
  }

  componentWillUnmount() {
    eventBus.removeListener(RendererEvents.SidebarTreeClicked, this.handleSidebarItemClicked);
  }

  private handleSidebarItemClicked = (pageKey: PageKey) => {
    this.setState({ pageKey });
  }

  render() {
    const { pageKey } = this.state;
    return (
      <div className="ani-app">
        <Sidebar pageKey={pageKey} />
        <GridView key={PageKey.MyPhotos} show={pageKey === PageKey.MyPhotos} />
        <ImageViewer />
      </div>
    );
  }

}

ReactDOM.render(<App />, document.getElementById('app'));
