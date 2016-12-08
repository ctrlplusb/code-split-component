/* @flow */
/* eslint-disable no-undef */
/* eslint-disable no-console */

import {
  STATE_IDENTIFIER,
  MODULE_CHUNK_MAPPING_IDENTIFIER,
} from './constants';
import { es6Safe } from './utils';

export default function rehydrateState() {
  return new Promise((resolve) => {
    if (
      // Has this source been bundled by webpack, making the following global
      // available?
      // $FlowFixMe
      !__webpack_require__
      // Running in the browser?
      || !window
      // Has the rehydrate state been bound to the window object?
      || !window[STATE_IDENTIFIER]
      // Has the module/chunk mapping been bound to the window object? If not
      // there is no point continuing as we won't know how to map the
      // moduleHash's to the correct webpack identifiers.
      || !window[MODULE_CHUNK_MAPPING_IDENTIFIER]
      ) {
      // Should we warn the user?  If they are using the rehydrateState
      // function perhaps they are expecting it to actually do some
      // rehydrating. :)
      resolve();
      return;
    }

    const moduleChunkMap = window[MODULE_CHUNK_MAPPING_IDENTIFIER];
    const { chunks, modules } = window[STATE_IDENTIFIER];

    const safelyFetchChunk = (chunkName : string) => {
      try {
        __webpack_require__.e(moduleChunkMap.chunks[chunkName]);
      } catch (err) {
        // We swallow the error. It's possible an active webpack plugin did
        // some "shifting around" of our chunks.
      }
    };

    const resolveModule = (moduleHash : string) => ({
      id: moduleHash,
      module: es6Safe(__webpack_require__(moduleChunkMap.modules[moduleHash])),
    });

    Promise.all(chunks.map(safelyFetchChunk))
      .then(() => modules.map(resolveModule))
      .then(resolve)
      .catch((err) => {
        console.log(
          'An error occurred whilst attempting to rehydrate code-split-component.',
          err,
          err.stack,
        );
      });
  });
}
