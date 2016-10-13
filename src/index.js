/* eslint-disable no-console */
/* eslint-disable react/forbid-prop-types */

// This has been completely stolen from @threepointone's amazing original
// implementation which can be found here:
// https://github.com/threepointone/react-modules
// Go look at his implementation! It is far more featureful.
// All props go to Sunil! Love love love.

import { Component, PropTypes } from 'react';

const BABEL_PLUGIN_REQUIRED_MESSAGE = `You must use the CodeSplitComponent with it\'s babel plugin.

For e.g.
  { "plugins": ["code-split-component/babel"] }

If you don't want to disable the code splitting feature without removing the CodeSplitComponent from your source then you can set the "noCodeSplitting" option for the babel plugin to \`true\`.

For e.g.
  { "plugins": [["code-split-component/babel", { "noCodeSplitting": true }]] }
`;

function es6Safe(module) {
  return module.default
    ? module.default
    : module;
}

class CodeSplitComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentWillMount() {
    const { path, noCodeSplitting, onError } = this.props;

    if (typeof path === 'string') {
      throw new Error(BABEL_PLUGIN_REQUIRED_MESSAGE);
    }

    if (noCodeSplitting) {
      // We have a require expression result.
      this.state = { component: es6Safe(path) };
    } else {
      // We have a System.import promise.
      path
        .then(component => this.setState({ component: es6Safe(component) }))
        .catch(err => (onError ? onError(err) : console.log(err)));
    }
  }

  render() {
    return this.props.children(this.state.component);
  }
}

CodeSplitComponent.propTypes = {
  path: PropTypes.any.isRequired,
  onError: PropTypes.func,
  children: PropTypes.func.isRequired,
  noCodeSplitting: PropTypes.bool,
};

export default CodeSplitComponent;
