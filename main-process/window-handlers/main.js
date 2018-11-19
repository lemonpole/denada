// @flow
import path from 'path';
import { ipcMain, dialog } from 'electron';
import moment from 'moment';

import { models } from '../../database';
import WindowManager from '../lib/window-manager';


/**
 * IPC Handlers
 */
function generateWeek( date: Date | void ) {
  const monday = moment( date ).startOf( 'isoweek' );
  const promises = [];

  moment.weekdaysShort().forEach( ( dayofweek: string, i: number ) => {
    const now = moment( monday ).add( i, 'days' );
    const revenueObj = models.Revenue.create({
      week: now.week(),
      month: now.month() + 1, // 0-indexed...
      year: now.year(),
      long_date: now.format(),
      adjustments: []
    });

    promises.push( revenueObj.save() );
  });

  return Promise.all( promises );
}

async function loadDataHandler( evt: Object, date: Date ) {
  // sort by the date so Monday is always first...
  const res = await models.Revenue.find(
    { week: moment( date ).week() },
    { sort: 'long_date' }
  );

  // if we got a hit return that and bail
  if( res.length > 0 ) {
    evt.sender.send( '/windows/main/loaded-data', res );
    return;
  }

  // if no hit, figure out if the database is fresh
  const isFresh = await models.Revenue.count() === 0;

  if( !isFresh ) {
    evt.sender.send( '/windows/main/no-data', date );
    return;
  }

  // if fresh, we'll want to generate the first week
  // for the UI to display on first load
  const nextweek = await generateWeek();

  // since the data coming back was asynchronously saved
  // it's out of order. sort it by date again
  nextweek.sort( ( a: models.Revenue, b: models.Revenue ) => (
    new Date( a.long_date ) - new Date( b.long_date )
  ) );

  evt.sender.send( '/windows/main/loaded-data', nextweek );
}

async function checkWeekHandler( evt: Object, date: Date ) {
  const res = await models.Revenue.find(
    { week: moment( date ).week() }
  );

  evt.sender.send( '/windows/main/checked-week', res.length > 0, date );
}

async function createweekDialogHandler( evt: Object, date: Date ) {
  const answer = dialog.showMessageBox({
    type: 'question',
    cancelId: 0,
    buttons: [ 'Cancel', 'Create' ],
    message: 'Week not found.',
    detail: 'Create it?',
    icon: path.join( __dirname, '../../build/background.png' )
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
  const PORT = process.env.PORT || 3000;
  const CONFIG = {
    url: `http://localhost:${PORT}/windows/main/index.html`,
    opts: {
      backgroundColor: '#f5f5f5', // "whitesmoke"
      minWidth: 800,
      minHeight: 600,
      maximizable: false
    }
  };

  WindowManager.createWindow( '/windows/main', CONFIG.url, CONFIG.opts );

  // ipc listeners
  ipcMain.on( '/windows/main/load-data', loadDataHandler );
  ipcMain.on( '/windows/main/check-week', checkWeekHandler );
  ipcMain.on( '/windows/main/dialogs/create-week', createweekDialogHandler );
};