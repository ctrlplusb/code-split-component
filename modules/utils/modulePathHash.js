/* @flow */

import md5 from 'md5';

function modulePathHash(modulePath: string) : string {
  const cleansedPath = modulePath
    .replace(/[/\\]index\.jsx?$/, '')
    .replace(/.jsx?$/, '');
  // This _should_ be enough of the hash for uniqueness.
  // Anything more starts to pump up the bundle sizes.
  return md5(cleansedPath).substr(0, 6);
}

export default modulePathHash;
