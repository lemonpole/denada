// @flow
import path from 'path';
import { ipcMain } from 'electron';
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
    backgroundColor: '#f5f5f5', // "whitesmoke"
    width: WIDTH,
    height: HEIGHT,
    frame: false,
    alwaysOnTop: true,
    maximizable: false,
    resizable: false,
    movable: false,
    minimizable: false,
    closable: false,
    fullscreenable: false
  }
};

let win;


// auto updater event handlers
function handleCheckingUpdate() {
  // @TODO
}

function handleUpdateAvail( info: Object ) {
  win.handle.webContents.send( '/windows/splash/update-avail' );
}

function handleDownloadProgress( progressObj: Object ) {
  win.handle.webContents.send( '/windows/splash/download-progress', progressObj );
}

function handleUpdateDownloaded( info: Object ) {
  win.handle.webContents.send( '/windows/splash/update-downloaded' );
}

function debuggingjawn() {
  let ivl;

  // immediately call `handleCheckingUpdate`
  handleCheckingUpdate();

  // after two seconds, say we found an update
  setTimeout( () => {
    handleUpdateAvail({});
  }, 2000 );

  // after two seconds, create a timer to call
  // handleDownloadProgress`
  setTimeout( () => {
    ivl = setInterval( () => {
      handleDownloadProgress({
        bytesPerSecond: 1500,
        percent: 50,
        transferred: 1500,
        total: 3000
      });
    }, 500 );
  }, 2500 );

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
  win = WindowManager.createWindow( '/windows/splash', CONFIG.url, CONFIG.opts );
};
