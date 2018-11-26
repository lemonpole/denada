// @flow
import { app, Menu } from 'electron';


// enum items get offset by one on osx because
// that first item is reserved for the application name
// see: https://electronjs.org/docs/api/menu#main-menus-name
export const MenuItems: Object = {
  APPNAME: 0,
  FILE: process.platform === 'darwin' ? 1 : 0,
  VIEW: process.platform === 'darwin' ? 2 : 1,
  WINDOW: process.platform === 'darwin' ? 3 : 2,
  HELP: process.platform === 'darwin' ? 4 : 3
};

export const DefaultMenuTemplate: Array<Object> = [
  {
    label: 'File',
    submenu: [
      { role: 'quit' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    role: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click() {
          require( 'electron' ).shell.openExternal( 'https://electronjs.org' );
        }
      }
    ]
  }
];

if( process.platform === 'darwin' ) {
  DefaultMenuTemplate.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services', submenu: []},
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  });

  DefaultMenuTemplate[ MenuItems.WINDOW ].submenu = [
    { role: 'close' },
    { role: 'minimize' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'front' }
  ];
}

// override the application's default menu with this one.
// window managers can set their own menu if this doesn't
// work for them...
function init() {
  const menu = Menu.buildFromTemplate( DefaultMenuTemplate );
  Menu.setApplicationMenu( menu );
}

export default {
  init
};
