// @flow
import { app } from 'electron';
import moment from 'moment';

import ipc from 'main/ipc';
import { SplashWindow, MainWindow, UpdateRevenueWindow } from 'main/window-handlers';
import Database from 'main/lib/database';
import WindowManager from 'main/lib/window-manager';
import DefaultMenu from 'main/lib/default-menu';


// Override the default moment locale and force it to
// recognize monday as the first day of the week
moment.updateLocale( 'en', {
  week: {
    dow: 1
  }
});
moment.locale( 'en' );


// event handlers
function handleOnReady() {
  // set the application menu
  DefaultMenu.init();

  // connect to the database first
  Database.connect().then( () => {
    // once connected we can load the application's
    // generic ipc handlers and window handlers
    ipc();
    SplashWindow();
    MainWindow();
    UpdateRevenueWindow();
  });
}

function handleAllClosed() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if( process.platform !== 'darwin' ) {
    app.quit();
  }
}

function handleOnActivate() {
  const windows = WindowManager.getWindows();

  if( Object.keys( windows ) === 0 ) {
    MainWindow();
  }
}

export default () => {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on( 'ready', handleOnReady );

  // Quit when all windows are closed.
  app.on( 'window-all-closed', handleAllClosed );

  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on( 'activate', handleOnActivate );
};
