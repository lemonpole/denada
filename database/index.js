// @flow
import path from 'path';
import { app } from 'electron';
import Datastore from 'nedb';


let database;

function promiseHandler( resolve: Function, reject: Function ): void {
  database = new Datastore({
    filename: path.join( app.getPath( 'userData' ), 'denada.db' ),
    autoload: true,
    onload: () => resolve( database )
  });
}

export default function connect(): Promise<any> {
  return new Promise( promiseHandler );
}
