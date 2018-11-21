// @flow
import path from 'path';
import { app } from 'electron';
import Datastore from 'nedb';


// module-level variables and functions
let database;

function promiseHandler( resolve: Function, reject: Function ): void {
  database = new Datastore({
    filename: path.join( app.getPath( 'userData' ), 'denada.db' ),
    autoload: true,
    onload: resolve
  });
}

export default class Database {
  static connect(): Promise<any> {
    return new Promise( promiseHandler );
  }

  static getClient() {
    if( !database ) {
      throw Error( 'Database not connected!' );
    }

    return database;
  }
}
