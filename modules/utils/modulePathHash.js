/* @flow */

import md5 from 'md5';

// This exists so that we can determinally resolve the webpack identifier for
// a module based on it's absolute file path. Webpack otherwise just uses an
// integer index which I have no idea how to get the mapping for.
function modulePathHash(modulePath: string) : string {
  const cleansedPath = modulePath
    .replace(/[/\\]index\.jsx?$/, '')
    .replace(/.jsx?$/, '');
  // This _should_ be enough of the hash for uniqueness.
  // Anything more starts to pump up the bundle sizes.
  return md5(cleansedPath).substr(0, 6);
}

export default modulePathHash;
