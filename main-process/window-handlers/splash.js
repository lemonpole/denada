// @flow
import path from 'path';
import is from 'electron-is';
import { autoUpdater } from 'electron-updater';
import WindowManager from 'main/lib/window-manager';


// module-level variables and constants
const PORT = process.env.PORT || 3000;
const WIDTH = 300;
const HEIGHT = 400;
const CONFIG = {
  url: is.production()
    ? `file://${path.join( __dirname, 'dist/renderer/windows/splash/index.html' )}`
    : `http://localhost:${PORT}/windows/splash/index.html`,
  opts: {
    titleBarStyle: 'hidden',
    backgroundColor: '#f5f5f5', // "whitesmoke"
    width: WIDTH,
    height: HEIGHT,
    maximizable: false
  }
};


// auto updater event handlers
function handleCheckingUpdate() {
  // @TODO
}

function handleDownloadProgress( progressObj: Object ) {
  // @TODO
}

function handleUpdateDownloaded( info: Object ) {
  // @TODO
}

function debuggingjawn() {
  // immediately call `handleCheckingUpdate`
  handleCheckingUpdate();

  // on a timer, call `handleDownloadProgress`
  // emulate downloadprogress object
  const ivl = setInterval( () => {
    handleDownloadProgress({
      bytesPerSecond: 1500,
      percent: 50,
      transferred: 1500,
      total: 3000
    });
  }, 500 );

  // after a few seconds, call `handleUpdateDownloaded`
  // and cancel the above timer
  setTimeout( () => {
    clearInterval( ivl );
    handleUpdateDownloaded({});
  }, 5000 );
}


export default () => {
  debuggingjawn();

  // auto updater logic and events
  // autoUpdater.checkForUpdates();
  // autoUpdater.on( 'checking-for-update', handleCheckingUpdate );
  // autoUpdater.on( 'download-progress', handleDownloadProgress );
  // autoUpdater.on( 'update-downloaded', handleUpdateDownloaded );

  // create the window
  WindowManager.createWindow( '/windows/splash', CONFIG.url, CONFIG.opts );
};
