// @flow
import path from 'path';
import { ipcMain } from 'electron';
import is from 'electron-is';
import Database from 'main/lib/database';
import WindowManager from 'main/lib/window-manager';


// module-level variables
let revenueObj;

// ipc handlers
function openWindowHandler( evt: Object, data: Object ) {
  const PORT = process.env.PORT || 3000;
  const WIDTH = 360;
  const HEIGHT = 480;
  const PARENT = WindowManager.getWindowById( '/windows/main' );
  const CONFIG = {
    url: is.production()
      ? `file://${path.join( __dirname, 'dist/renderer/windows/update-revenue/index.html' )}`
      : `http://localhost:${PORT}/windows/update-revenue/index.html`,
    opts: {
      parent: PARENT.handle,
      modal: true,
      backgroundColor: '#f5f5f5', // "whitesmoke"
      width: WIDTH,
      height: HEIGHT,
      resizable: false
    }
  };

  WindowManager.createWindow( '/windows/update-revenue', CONFIG.url, CONFIG.opts );
  revenueObj = data;
}

function closeWindowHandler( evt: Object, cancel: boolean = false ) {
  // close the update-revenue window
  WindowManager.getWindowById( '/windows/update-revenue' )
    .handle
    .close();

  // if the user did not cancel (manually close the window) then
  // let the main window know that we're done updating the revenue doc
  // and the update-revenue window is now closed
  if( !cancel ) {
    WindowManager.getWindowById( '/windows/main' )
      .handle
      .webContents
      .send( '/windows/update-revenue/closed', revenueObj );
  }
}

function fetchRevenueHandler( evt: Object ) {
  evt.sender.send( '/windows/update-revenue/loaded-data', revenueObj );
}

async function updateRevenueHandler( evt: Object, data: Object ) {
  revenueObj = await new Promise( ( resolve, reject ) => {
    Database.getClient().update(
      { _id: data._id },
      data,
      {},
      ( err, numReplace: number ) => resolve( data )
    );
  });

  // let the update-revenue window know that we're done updating
  // the revenue doc
  evt.sender.send( '/windows/update-revenue/updated' );
}

export default () => {
  ipcMain.on( '/windows/update-revenue/open', openWindowHandler );
  ipcMain.on( '/windows/update-revenue/close', closeWindowHandler );
  ipcMain.on( '/windows/update-revenue/load-data', fetchRevenueHandler );
  ipcMain.on( '/windows/update-revenue/update', updateRevenueHandler );
};
