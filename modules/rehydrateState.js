/* @flow */
/* eslint-disable no-undef */
/* eslint-disable no-console */

import STATE_IDENTIFIER from './stateIdentifier';
import chunkNameHash from './utils/chunkNameHash';

function logError(err) {
  console.log(
    'An error occurred whilst attempting to rehydrate code-split-component.',
    err,
    err.stack
  );
}

function rehydrate() {
  if (!__webpack_require__) {
    console.log('code-split-component rehydration requires that your source is bundled with webpack.');
  }

  return new Promise((resolve) => {
    if (!window || !window[STATE_IDENTIFIER]) {
      resolve();
      return;
    }

    const { chunks, modules } = window[STATE_IDENTIFIER];

    Promise.all(chunks.map(chunkName => __webpack_require__.e(chunkNameHash(chunkName))))
      .then(() =>
        modules.map(moduleId => ({
          id: moduleId,
          module: __webpack_require__(moduleId),
        }))
      )
      .then(resolve)
      .catch(logError);
  });
}

export default rehydrate;
