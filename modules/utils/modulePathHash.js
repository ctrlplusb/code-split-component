/* @flow */

import md5 from 'md5';

function modulePathHash(modulePath: string) : string {
  // This _should_ be enough of the hash for uniqueness.
  // Anything more starts to pump up the bundle sizes.
  return md5(modulePath).substr(0, 6);
}

export default modulePathHash;
