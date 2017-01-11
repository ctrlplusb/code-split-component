/* @flow */

import md5 from 'md5';

type ResolvedModules = { [key: string]: any };
type ResolveModules = () => ResolvedModules;

// Given the module, if the module is an ES6 module, then the "default" is
// returned.
export const es6Safe = (module : any) =>
  (module && module.default ? module.default : module);

/**
 * Ensures that the "default" export is returned if the resolved modules
 * are ES6 modules.
 */
export const ensureES6Safe = (x : ResolveModules) => () => {
  const result = x();
  Object.keys(result).forEach((key) => {
    result[key] = es6Safe(result[key]);
  });
  return result;
};

/**
 * This exists so that we can create a deterministic unique value to identify
 * a module with. We use the module's absolute path as that is unique, but
 * we can't just use the path in the module maps as these will be served to
 * browsers.  Therefore we hash the filepath.
 */
export const modulePathHash = (modulePath: string) => {
  const cleansedPath = modulePath
    // remove index files as they would be equivalent to just the folder specified
    .replace(/[/\\]index\.jsx?$/, '')
    // remove any extension
    .replace(/.jsx?$/, '')
    // We don't want base path as it changes per environment.
    .replace(process.cwd(), '');
  // This _should_ be enough of the hash for uniqueness.
  // Anything more starts to pump up the bundle sizes.
  return md5(cleansedPath).substr(0, 12);
};
