/* @flow */
/* eslint-disable no-undef */
/* eslint-disable no-console */

import STATE_IDENTIFIER from './stateIdentifier';

function logError(err) {
  console.log(
    'An error occurred whilst attempting to rehydrate code-split-component.',
    err
  );
}

function resolveModule(moduleId) {
  return Promise.resolve({
    id: moduleId,
    module: __webpack_require__(moduleId),
  });
}

function rehydrate() {
  if (!__webpack_require__) {
    console.log('code-split-component rehydration requires that your source is bundled with webpack.');
  }

  return new Promise((resolve) => {
    if (window && window[STATE_IDENTIFIER]) {
      resolve();
      return;
    }

    const { modules } = windowwindow[STATE_IDENTIFIER];

    // Ensure our primary bundle chunk is loaded
    __webpack_require__.e/* nsure */(0)
      .then(() => Promise.all(modules.map(resolveModule)))
      .then(resolve)
      .catch(logError);
  });
}

export default rehydrate;
