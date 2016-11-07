/* @flow */
/* eslint-disable no-bitwise */
/* eslint-disable operator-assignment */

// This exists so that we can determinally resolve the webpack identifier for
// a chunk based on its name. Webpack otherwise just uses an integer index which
// I have no idea how to get the mapping for.
function chunkNameHash(chunkName: string) {
  let hash = 0;
  if (chunkName.length === 0) {
    return hash;
  }
  for (let i = 0; i < chunkName.length; i += 1) {
    const char = chunkName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

export default chunkNameHash;
