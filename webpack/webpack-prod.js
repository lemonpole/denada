import path from 'path';
import webpack from 'webpack';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import webpackConfigShared from './webpack-shared.js';
import webpackConfigResolve from './webpack-resolve.js';


const ROOT = path.join( __dirname, '../' );

export default {
  mode: 'production',
  resolve: webpackConfigResolve,
  entry: {
    splash: path.join( ROOT, 'renderer-process/windows/splash/index' ),
    main: path.join( ROOT, 'renderer-process/windows/main/index' ),
    'update-revenue': path.join( ROOT, 'renderer-process/windows/update-revenue/index' )
  },
  output: {
    filename: '[name]/[name].js',
    path: path.join( ROOT, 'dist/renderer/windows' )
  },
  module: {
    rules: [
      webpackConfigShared.loaders.js,
      webpackConfigShared.loaders.eslint,
      webpackConfigShared.loaders.js,
      webpackConfigShared.loaders.eslint,
      webpackConfigShared.loaders.css,
      webpackConfigShared.loaders.scss,
      webpackConfigShared.loaders.images,
      webpackConfigShared.loaders.fonts
    ]
  },
  plugins: [
    new CleanWebpackPlugin([ 'dist' ], {
      root: ROOT
    }),
    new HtmlWebpackPlugin({
      filename: 'splash/index.html',
      template: path.join( __dirname, 'index.template.html' ),
      chunks: [ 'splash' ]
    }),
    new HtmlWebpackPlugin({
      filename: 'main/index.html',
      template: path.join( __dirname, 'index.template.html' ),
      chunks: [ 'main' ]
    }),
    new HtmlWebpackPlugin({
      filename: 'update-revenue/index.html',
      template: path.join( __dirname, 'index.template.html' ),
      chunks: [ 'update-revenue' ]
    })
  ],

  // needed to set all of electron built-in modules as externals plus some
  // other bits here and there
  target: 'electron-renderer'
};
