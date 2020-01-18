import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Sidebar from 'renderer/components/Sidebar';

class App extends Component {

  render() {
    return (
      <div className="ani-app">
        <Sidebar />
      </div>
    );
  }

}

ReactDOM.render(<App />, document.getElementById('app'));
