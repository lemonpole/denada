// @flow
import path from 'path';
import { app } from 'electron';
import Datastore from 'nedb';


let database;

export default function connect() {
  // $FlowSkip
  return new Promise( ( resolve, reject ) => {
    database = new Datastore({
      filename: path.join( app.getPath( 'userData' ), 'denada.db' ),
      autoload: true,
      onload: () => resolve( database )
    });
  });
}
