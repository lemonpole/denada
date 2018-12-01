// @flow
import path from 'path';
import is from 'electron-is';
import WindowManager from 'main/lib/window-manager';


// module-level variables and constants
const PORT = process.env.PORT || 3000;
const WIDTH = 200;
const HEIGHT = 400;
const CONFIG = {
  url: is.production()
    ? `file://${path.join( __dirname, 'dist/renderer/windows/splash/index.html' )}`
    : `http://localhost:${PORT}/windows/splash/index.html`,
  opts: {
    titleBarStyle: 'hidden',
    backgroundColor: '#f5f5f5', // "whitesmoke"
    width: WIDTH,
    height: HEIGHT,
    maximizable: false
  }
};

export default () => {
  WindowManager.createWindow( '/windows/splash', CONFIG.url, CONFIG.opts );
};
