/* @flow */

import { Children, Component, PropTypes } from 'react';

class CodeSplitProvider extends Component {
  // Prop types.
  static propTypes = {
    children: PropTypes.element.isRequired,
    context: PropTypes.object,
    rehydrations: PropTypes.arrayOf(PropTypes.object),
  };

  // Context types
  static childContextTypes = {
    registerChunkLoaded: PropTypes.func.isRequired,
    registerModule: PropTypes.func.isRequired,
    retrieveModule: PropTypes.func.isRequired,
  };

  // Members.
  chunks : { [key: string]: true } = {};
  modules : { [key: string]: Function } = {};

  getChildContext() {
    return {
      registerChunkLoaded: this.retrieveModule,
      registerModule: this.registerModule,
      retrieveModule: this.retrieveModule,
    };
  }

  componentWillMount() {
    const { rehydrations } = this.props;
    rehydrations.forEach(({ id, module }) => this.registerModule(id, module));
  }

  registerChunkLoaded = (chunkName: string) => {
    this.chunks[chunkName] = true;
    if (this.props.context) {
      this.props.context.registerChunk(chunkName);
    }
  }

  registerModule = (id: string, module: Function) => {
    this.modules[id] = module;
    if (this.props.context) {
      this.props.context.registerModule(id);
    }
  }

  retrieveModule = (id: string) => this.modules[id];

  render() {
    return Children.only(this.props.children);
  }
}

export default CodeSplitProvider;
