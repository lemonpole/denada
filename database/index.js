// @flow
import { app } from 'electron';
import Camo from 'camo';
import Adjustment from './adjustment';
import Revenue from './revenue';


// const DB_URI = 'nedb://memory';
const DB_URI = `nedb://${app.getPath( 'userData' )}/denada`;
let database;

export async function connect() {
  database = database || await Camo.connect( DB_URI );
  return Promise.resolve( database );
}

export const models = {
  Adjustment,
  Revenue
};
