/* @flow */

import { Component, PropTypes } from 'react';

let HMR_NOT_SUPPORTED;

if (process.env.NODE_ENV === 'development') {
  HMR_NOT_SUPPORTED = `
================================================================================
ERROR: code-split-component

Sorry, unfortunately code-split-component does not support hot module reloading.

If you wish to use it in a hot relaoading environment please set the 'disabled'
option on both the babel and webpack plugins to true.  This will force the
code-split-component instances to work in a synchronous manner that is friendlier
to development and hot reloading environments.  Code splitting is a production
based optimisation, so hopefully this is not an issue for you.

e.g.

const webpackConfig = {
  plugins: [
    new CodeSplitWebpackPlugin({
      // The code-split-component doesn't work nicely with hot module reloading,
      // which we use in our development builds, so we will disable it (which
      // ensures synchronously behaviour on the CodeSplit instances).
      disabled: process.env.NODE_ENV === 'development',
    }),
  ],
  module: {
    rules: [
      {
        test: 'js',
        loader: 'babel',
        query: {
          plugins: [
            [
              'code-split-component/babel',
              {
                // The code-split-component doesn't work nicely with hot
                // module reloading, which we use in our development builds,
                // so we will disable it (which ensures synchronously
                // behaviour on the CodeSplit instances).
                disabled: process.env.NODE_ENV === 'development',
              },
            ],
          ]
        }
      }

    ]
  }
}

================================================================================`;
} else {
  HMR_NOT_SUPPORTED = 'HMR not supported for code-split-component';
}

const es6Safe = module => (module.default ? module.default : module);
const ensureES6Safe = (x) => () => {
  const result = x();
  Object.keys(result).forEach(key => {
    result[key] = es6Safe(result[key]);
  });
  return result;
};

type Resolved = { [key: string]: Function };

class CodeSplit extends Component {
  static contextTypes = {
    registerChunkLoaded: PropTypes.func.isRequired,
    registerModule: PropTypes.func.isRequired,
    retrieveModule: PropTypes.func.isRequired,
  };

  static propTypes = {
    chunkName: PropTypes.string.isRequired,
    moduleMap: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    modules: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
    children: PropTypes.func.isRequired,
  };

  state = { resolving: false };

  componentWillMount() {
    const { modules, moduleMap } = this.props;
    if (typeof modules === 'function') {
      if (module.hot) {
        throw new Error(HMR_NOT_SUPPORTED);
      }

      // Async modules.
      const alreadyResolved =
        Object.keys(moduleMap).length === Object.keys(this.getModules()).length;
      if (!alreadyResolved) {
        // Not all the modules have been resolved yet.
        this.setState({ resolving: true });
        // Fire the fetch modules function.
        modules(this.resolutionCallback);
      }
    } else if (moduleMap) {
      // Sync modules.
      // We have a module map available. This probably means an SSR render is
      // occurring, so lets register these modules.
      this.resolutionCallback(modules);
    }
  }

  resolutionCallback = (resolved: Resolved) => {
    const { chunkName, moduleMap } = this.props;
    const { registerChunkLoaded, registerModule } = this.context;
    registerChunkLoaded(chunkName);
    Object.keys(resolved).forEach((moduleName) =>
      registerModule(
        moduleMap[moduleName], // id
        resolved[moduleName] // module
      )
    );
    this.setState({ resolving: false });
  }

  getModules = ensureES6Safe(() => {
    const { modules } = this.props;
    if (typeof modules === 'object') {
      // Sync modules.
      return modules;
    }
    // Async modules, retrieve from registry.
    const { moduleMap } = this.props;
    const { retrieveModule } = this.context;
    const moduleNames = Object.keys(moduleMap);
    return moduleNames.reduce((acc, moduleName) => {
      const moduleId = moduleMap[moduleName];
      const module = retrieveModule(moduleId);
      if (module) {
        acc[moduleName] = module; // eslint-disable-line no-param-reassign
      }
      return acc;
    }, {});
  })

  render() {
    return this.props.children(this.getModules()) || null;
  }
}

export default CodeSplit;
