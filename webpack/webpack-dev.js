import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpackConfigShared from './webpack-shared.js';
import webpackConfigResolve from './webpack-resolve.js';


const PORT = process.env.PORT || 3000;
const ROOT = path.join( __dirname, '../' );

export default {
  mode: 'development',
  resolve: webpackConfigResolve,
  entry: {
    splash: [
      'react-hot-loader/patch',
      `webpack-hot-middleware/client?reload=true&path=http://localhost:${PORT}/__webpack_hmr`,
      path.join( ROOT, 'renderer-process/windows/splash/index' )
    ],
    main: [
      'react-hot-loader/patch',
      `webpack-hot-middleware/client?reload=true&path=http://localhost:${PORT}/__webpack_hmr`,
      path.join( ROOT, 'renderer-process/windows/main/index' )
    ],
    'update-revenue': [
      'react-hot-loader/patch',
      `webpack-hot-middleware/client?reload=true&path=http://localhost:${PORT}/__webpack_hmr`,
      path.join( ROOT, 'renderer-process/windows/update-revenue/index' )
    ]
  },
  output: {
    filename: '[name].js',
    publicPath: `http://localhost:${PORT}/windows/`
  },
  module: {
    rules: [
      webpackConfigShared.loaders.js,
      webpackConfigShared.loaders.eslint,
      webpackConfigShared.loaders.css,
      webpackConfigShared.loaders.scss,
      webpackConfigShared.loaders.images,
      webpackConfigShared.loaders.fonts
    ]
  },
  plugins: [
    // https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
    new webpack.HotModuleReplacementPlugin(),
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
