// @flow
import path from 'path';
import { ipcMain, dialog, nativeImage, Menu } from 'electron';
import is from 'electron-is';
import moment from 'moment';
import is from 'electron-is';

import Database from 'main/lib/database';
import WindowManager from 'main/lib/window-manager';
import DefaultMenuTemplate from 'main/lib/default-menu';
import icondataurl from 'resources/background.png';


// module-level variables and constants
const PORT = process.env.PORT || 3000;
const CONFIG = {
  url: is.production()
    ? `file://${path.join( __dirname, 'dist/renderer/windows/main/index.html' )}`
    : `http://localhost:${PORT}/windows/main/index.html`,
  opts: {
    backgroundColor: '#f5f5f5', // "whitesmoke"
    minWidth: 800,
    minHeight: 600,
    maximizable: false
  }
};

// ipc handlers
function openWindowHandler( evt: Object, data: Object ) {
  const win = WindowManager.createWindow( '/windows/main', CONFIG.url, CONFIG.opts );
  win.handle.setMenu( DefaultMenuTemplate );

  // the `setMenu` function above doesn't work on
  // osx so we'll have to accomodate for that
  if( is.osx() ) {
    Menu.setApplicationMenu( DefaultMenuTemplate );
  }
}

function generateWeek( date: Date | void ) {
  const db = Database.getClient();
  const monday = moment( date ).startOf( 'isoweek' );
  const promises = [];

  moment.weekdaysShort().forEach( ( dayofweek: string, i: number ) => {
    const now = moment( monday ).add( i, 'days' );
    const revenueObj = new Promise( ( resolve, reject ) => {
      db.insert({
        week: now.week(),
        month: now.month() + 1, // 0-indexed...
        year: now.year(),
        long_date: now.format(),
        paper_orders: 0.00,
        deliveries: 0.00,
        expenses: []
      }, ( err, doc ) => resolve( doc ) );
    });

    promises.push( revenueObj );
  });

  return Promise.all( promises );
}

async function loadDataHandler( evt: Object, date: Date ) {
  // sort by the date so Monday is always first...
  const db = Database.getClient();
  const res = await new Promise( ( resolve, reject ) => {
    db.find({
      week: moment( date ).week()
    }).sort({
      long_date: 1
    }).exec(
      ( err, docs ) => resolve( docs )
    );
  });

  // if we got a hit return that and bail
  if( res.length > 0 ) {
    evt.sender.send( '/windows/main/loaded-data', res );
    return;
  }

  // if no hit, figure out if the database is fresh
  const isFresh = await new Promise( ( resolve, reject ) => {
    db.count({}, ( err, count: number ) => {
      resolve( count === 0 );
    });
  });

  if( !isFresh ) {
    evt.sender.send( '/windows/main/no-data', date );
    return;
  }

  // if fresh, we'll want to generate the first week
  // for the UI to display on first load
  const nextweek = await generateWeek();

  // since the data coming back was asynchronously saved
  // it's out of order. sort it by date again
  nextweek.sort( ( a: Object, b: Object ) => (
    new Date( a.long_date ) - new Date( b.long_date )
  ) );

  evt.sender.send( '/windows/main/loaded-data', nextweek );
}

async function checkWeekHandler( evt: Object, date: Date ) {
  const db = Database.getClient();
  const res = await new Promise( ( resolve, reject ) => {
    db.find(
      { week: moment( date ).week() },
      ( err, docs ) => resolve( docs )
    );
  });

  evt.sender.send( '/windows/main/checked-week', res.length > 0, date );
}

async function createweekDialogHandler( evt: Object, date: Date ) {
  const answer = dialog.showMessageBox({
    type: 'question',
    cancelId: 0,
    buttons: [ 'Cancel', 'Create' ],
    message: 'Week not found.',
    detail: 'Create it?',
    icon: nativeImage.createFromDataURL( icondataurl )
  });

  if( answer > 0 ) {
    // let the renderer know we're creating the week
    evt.sender.send( '/windows/main/dialogs/creating-week', date );

    // let the renderer know once we're done...
    const res = await generateWeek( date );
    evt.sender.send( '/windows/main/dialogs/created-week', res );
  }
}

export default () => {
  // ipc listeners
  ipcMain.on( '/windows/main/open', openWindowHandler );
  ipcMain.on( '/windows/main/load-data', loadDataHandler );
  ipcMain.on( '/windows/main/check-week', checkWeekHandler );
  ipcMain.on( '/windows/main/dialogs/create-week', createweekDialogHandler );
};
