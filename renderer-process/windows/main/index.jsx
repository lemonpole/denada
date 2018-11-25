import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import moment from 'moment';

import './index.scss';
import App from './app';


// Override the default moment locale and force it to
// recognize monday as the first day of the week
moment.updateLocale( 'en', {
  week: {
    dow: 1
  }
});
moment.locale( 'en' );

const render = ( Component ) => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById( 'root' )
  );
};

render( App );

if( module.hot ) {
  module.hot.accept( './app', () => { render( App ); });
}
