// @flow
import { app } from 'electron';
import moment from 'moment';
import ipc from './ipc';
import connect from '../database';
import { MainWindow, UpdateRevenueWindow } from './window-handlers';
import WindowManager from './lib/window-manager';


// Override the default moment locale and force it to
// recognize monday as the first day of the week
moment.updateLocale( 'en', {
  week: {
    dow: 1
  }
});
moment.locale( 'en' );

function main( db ) {
  ipc();
  MainWindow( db );
  UpdateRevenueWindow( db );
}

export default () => {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on( 'ready', () => {
    // connect to the database
    connect().then( main );
  });

  // Quit when all windows are closed.
  app.on( 'window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if( process.platform !== 'darwin' ) {
      app.quit();
    }
  });

  app.on( 'activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // @TODO: not working...
    const windows = WindowManager.getWindows();

    if( Object.keys( windows ) === 0 ) {
      MainWindow();
    }
  });
};
