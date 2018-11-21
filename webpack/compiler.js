/* eslint-disable no-console, dot-notation */
import express from 'express';
import minimist from 'minimist';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { spawn } from 'child_process';

import sharedconfig from './webpack-shared';
import devconfig from './webpack-dev';
import prodconfig from './webpack-prod';
import electronconfig from './webpack-electron';


const IS_PROD = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;
const ARGS = minimist( process.argv.slice( 2 ) );

// figure out config to use
let config = IS_PROD ? prodconfig : devconfig;
if( IS_PROD && ARGS[ 'electron' ] ) {
  config = electronconfig;
}

// and then load into webpack
const COMPILER = webpack( config );

function handleProduction() {
  COMPILER.run( ( err, stats ) => {
    console.log(
      stats.toJson( sharedconfig.compilerConfig )
    );
  });
}

function handleDev() {
  // inject the webpack middleware modules into the server
  const app = express();
  const wdm = webpackDevMiddleware( COMPILER, {
    quiet: false,
    publicPath: devconfig.output.publicPath,
    stats: sharedconfig.compilerConfig
  });

  app.use( wdm );
  app.use( webpackHotMiddleware( COMPILER ) );

  // start the server!
  let childProcess;

  const server = app.listen( PORT, 'localhost', ( err ) => {
    if( err ) {
      console.error( err );
      return;
    }

    // are we also starting electron?
    if( ARGS[ 'dev-electron' ] ) {
      childProcess = spawn(
        'npm',
        [
          'run',
          'start:dev-electron',
          ARGS[ 'dev-console' ] ? '-- --dev-console' : ''
        ], {
          shell: true,
          env: process.env,
          stdio: 'inherit'
        }
      )
        .on( 'close', code => process.exit( code ) )
        .on( 'error', spawnError => console.error( spawnError ) );
    }

    console.log( `Listening at http://localhost:${PORT}` );
  });

  // we need to handle exiting the server since we're spawning a process above
  // depending on the arguments passed
  process.on( 'SIGTERM', () => {
    console.log( 'Stopping dev server' );

    childProcess.kill();
    wdm.close();
    server.close( () => process.exit( 0 ) );
  });
}

if( process.env.NODE_ENV === 'production' ) {
  handleProduction();
} else {
  handleDev();
}
