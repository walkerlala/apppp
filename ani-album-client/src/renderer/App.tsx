import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Sidebar from 'renderer/components/Sidebar';
import { ClientMessageType } from 'common/message';
import { ipcRenderer } from 'electron';

class App extends Component {

  componentDidMount() {
    this.fetchInitialImages();
  }

  async fetchInitialImages() {
    const result = await ipcRenderer.invoke(ClientMessageType.GetAllImages, {
      offset: 0,
      length: 200,
    });
    console.log(result);
  }

  render() {
    return (
      <div className="ani-app">
        <Sidebar />
      </div>
    );
  }

}

ReactDOM.render(<App />, document.getElementById('app'));
