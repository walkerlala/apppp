import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Sidebar from 'renderer/Sidebar';
import GridView from 'renderer/GridView';
import './App.scss';

class App extends Component {

  render() {
    return (
      <div className="ani-app">
        <Sidebar />
        <GridView />
      </div>
    );
  }

}

ReactDOM.render(<App />, document.getElementById('app'));
