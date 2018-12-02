// @flow
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { Progress } from 'antd';
import './app.scss';
import icondataurl from 'resources/background.png';


type State = {
  status: string
};

class App extends Component<{}, State> {
  state = {
    status: 'Checking for updates...'
  }

  componentDidMount() {
    ipcRenderer.on( '/windows/splash/checking-update', this.handleCheckingUpdate );
    ipcRenderer.on( '/windows/splash/update-avail', this.handleUpdateAvail );
    ipcRenderer.on( '/windows/splash/download-progress', this.handleDownloadProgress );
    ipcRenderer.on( '/windows/splash/update-downloaded', this.handleUpdateDownloaded );
  }

  handleCheckingUpdate = () => {
    // @TODO
  }

  handleUpdateAvail = () => {
    this.setState({ status: 'Downloading update...' });
  }

  handleDownloadProgress = () => {
    // @TODO
  }

  handleUpdateDownloaded = () => {
    // @TODO
  }

  render() {
    return (
      <div id="splash">
        <img src={icondataurl} alt={'denada'} />
        <p>{this.state.status}</p>
        <Progress
          percent={0}
          status={'active'}
        />
      </div>
    );
  }
}

export default App;
