// @flow
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { Progress } from 'antd';
import './app.scss';
import icondataurl from 'resources/background.png';


type State = {
  status: string,
  downloading: boolean,
  progress: number
};

class App extends Component<{}, State> {
  state = {
    status: 'Checking for updates...',
    downloading: false,
    progress: 0
  }

  componentDidMount() {
    ipcRenderer.on( '/windows/splash/checking-update', this.handleCheckingUpdate );
    ipcRenderer.on( '/windows/splash/no-update-avail', this.handleNoUpdateAvail );
    ipcRenderer.on( '/windows/splash/update-avail', this.handleUpdateAvail );
    ipcRenderer.on( '/windows/splash/download-progress', this.handleDownloadProgress );
    ipcRenderer.on( '/windows/splash/update-downloaded', this.handleUpdateDownloaded );
  }

  handleCheckingUpdate = () => {
    // @TODO
  }

  handleNoUpdateAvail = () => {
    this.setState({
      status: 'Up to date.'
    });
  }

  handleUpdateAvail = () => {
    this.setState({
      status: 'Downloading update...',
      downloading: true
    });
  }

  handleDownloadProgress = ( evt: Event, progressObj: Object ) => {
    this.setState({
      progress: progressObj.percent
    });
  }

  handleUpdateDownloaded = () => {
    this.setState({
      status: 'Done.',
      downloading: false
    });
  }

  render() {
    return (
      <div id="splash">
        <img src={icondataurl} alt={'denada'} />
        <p>{this.state.status}</p>
        <div className="progress-container">
          {this.state.downloading && (
            <Progress
              percent={this.state.progress}
              status={'active'}
            />
          )}
        </div>
      </div>
    );
  }
}

export default App;
