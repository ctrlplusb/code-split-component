/* @flow */

// Useful references:
// https://github.com/webpack/docs/wiki/How-to-write-a-plugin
// https://webpack.github.io/docs/api-in-modules.html

import modulePathHash from '../utils/modulePathHash';
import chunkNameHash from '../utils/chunkNameHash';

type Options = {
  disabled?: boolean,
  role: 'server'|'client',
};

function CodeSplitPlugin(options: Options) {
  this.options = options || {};
}

CodeSplitPlugin.prototype.apply = function apply(compiler) {
  const options = this.options;
  compiler.plugin('compilation', (compilation) => {
    compilation.plugin('before-module-ids', (modules) => {
      if (options.disabled) {
        return;
      }

      modules.forEach((module) => {
        if (module.id === null && module.libIdent) {
          const createHashedModuleId =
            module.resource.indexOf('node_modules') === -1
            && module.chunks.length > 0;
          if (createHashedModuleId) {
            module.id = modulePathHash(module.resource); // eslint-disable-line no-param-reassign
          } else {
            // Otherwise we will use the standard number based identifiers.
          }
        }
      }, this);
    });
    compilation.plugin('before-chunk-ids', (chunks) => {
      if (options.disabled) {
        return;
      }

      chunks.forEach((chunk) => {
        if (chunk.id === null && chunk.name) {
          chunk.id = chunkNameHash(chunk.name); // eslint-disable-line no-param-reassign
        }
      });
    });
  });
};

module.exports = CodeSplitPlugin;
