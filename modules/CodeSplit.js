/* @flow */

import { Component, PropTypes } from 'react';

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
