/* @flow */

import { Component, PropTypes } from 'react';

const es6Safe = module => (module.default ? module.default : module);

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
        console.log('Resolving modules for', this.props.chunkName); // eslint-disable-line
        this.setState({ resolving: true });
        // Fire the fetch modules function.
        modules(this.resolutionCallback);
      }
    }
  }

  resolutionCallback = (resolved: Resolved) => {
    const { chunkName, moduleMap } = this.props;
    const { registerChunkLoaded, registerModule } = this.context;
    registerChunkLoaded(chunkName);
    Object.keys(resolved).forEach((moduleName) =>
      registerModule(
        moduleMap[moduleName], // id
        es6Safe(resolved[moduleName]) // module
      )
    );
  }

  getModules = () => {
    const { modules } = this.props;
    if (typeof modules === 'object') {
      // Sync modules.
      return modules;
    }
    // Async modules, retrieve from registry.
    const { moduleMap } = this.props;
    const { retrieveModule } = this.context;
    const moduleIds = Object.keys(moduleMap);
    return moduleIds.reduce((acc, moduleName) => {
      const key = moduleMap[moduleName];
      const module = retrieveModule(key);
      acc[moduleName] = module; // eslint-disable-line no-param-reassign
      return acc;
    }, {});
  }

  render() {
    return this.props.children(this.getModules()) || null;
  }
}

export default CodeSplit;
