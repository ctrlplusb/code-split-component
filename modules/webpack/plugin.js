/* @flow */

import modulePathHash from '../utils/modulePathHash';

function CodeSplitPlugin() { }

CodeSplitPlugin.prototype.apply = (compiler) => {
  compiler.plugin('compilation', (compilation) => {
    compilation.plugin('before-module-ids', (modules) => {
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
  });
};

export default CodeSplitPlugin;
