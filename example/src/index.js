import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './App';

const mountOn = document.getElementById('app');

function render(TheApp) {
  const toRender = (
    <AppContainer>
      <TheApp />
    </AppContainer>
  );

  ReactDOM.render(toRender, mountOn);
}

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./index.js');
  module.hot.accept(
    './App',
    () => render(require('./App').default)
  );
}

render(App);
