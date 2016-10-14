/* eslint-disable no-console */
/* eslint-disable react/forbid-prop-types */

import { Component, PropTypes } from 'react';

const MISSING_PROP = 'You must supply at least a "module" or a "modules" prop to the "CodeSplit" component.';

function es6Safe(module) {
  return module.default
    ? module.default
    : module;
}

class CodeSplit extends Component {
  constructor(props) {
    super(props);

    const { module, modules, moduleCount } = this.props;

    if (!module && !modules) {
      throw new Error(MISSING_PROP);
    }

    const modulesLength = modules
      ? moduleCount || modules.length
      : 0;

    this.state = {
      result: module
        ? null
        : Array.from({ length: modulesLength }, () => null),
    };
  }

  componentWillMount() {
    const { module, modules, transpiled, onError } = this.props;

    if (transpiled) {
      // We will are receiving results for regular "require" expressions.
      this.setState({
        result: module
          ? es6Safe(module)
          : modules.map(es6Safe),
      });
    } else {
      // We have a System.import single promise or a Promise.all result.
      (module || modules)
        .then(result => this.setState({
          result: module
            ? es6Safe(result)
            : result.map(es6Safe),
        }))
        .catch(err => (onError ? onError(err) : console.log(err)));
    }
  }

  render() {
    return this.props.children(this.state.result);
  }
}

CodeSplit.propTypes = {
  module: PropTypes.any,
  modules: PropTypes.any,
  moduleCount: PropTypes.number,
  onError: PropTypes.func,
  children: PropTypes.func.isRequired,
  transpiled: PropTypes.bool,
};

export default CodeSplit;
