// @flow
import { ipcMain } from 'electron';
import WindowManager from '../lib/window-manager';
import { models } from '../../database';


// module-level variables
let revenueObj;

// ipc handlers
function openWindowHandler( evt: Object, data: Object ) {
  const PORT = process.env.PORT || 3000;
  const WIDTH = 360;
  const HEIGHT = 480;
  const PARENT = WindowManager.getWindowById( '/windows/main' );

  const CONFIG = {
    url: `http://localhost:${PORT}/windows/update-revenue/index.html`,
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
  revenueObj = await models.Revenue.findOneAndUpdate(
    { _id: data._id },
    data
  );

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