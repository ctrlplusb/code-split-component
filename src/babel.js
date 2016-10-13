/* eslint-disable new-cap */

// This has been completely stolen from @threepointone's amazing original
// implementation which can be found here:
// https://github.com/threepointone/react-modules
// Go look at his implementation! It is far more featureful.
// All props go to Sunil! Love love love.

const template = require('babel-template');

// -----------------------------------------------------------------------------
// PRIVATES

const CODE_SPLIT_COMPONENT_NAME = 'CodeSplitComponent';

const INVALID_PATH_PROP_MSG = `You must supply a string literal to the "path" property of the "CodeSplitComponent". It should be the relative path to the Component you would like to load and code split against. For example:
  <CodeSplitComponent path="./Foo">
    {
      Foo => Foo
        ? <Foo />
        : <span>Loading..</span>
    }
  </CodeSplitComponentLoader>`;

const CODE_SPLIT_TEMPLATE = template('System.import(SOURCE)');
const NO_CODE_SPLIT_TEMPLATE = template('require(SOURCE)');

const TRUE = template('true');
const FALSE = template('false');

// -----------------------------------------------------------------------------
// PLUGIN

function codeSplitComponentPlugin({ types: t }) {
  return {
    visitor: {
      JSXElement(path, state) {
        const noCodeSplitting = state.opts.noCodeSplitting;

        if (path.node.openingElement.name.name === CODE_SPLIT_COMPONENT_NAME) {
          path.node.openingElement.attributes.forEach((attr) => {
            if (!attr.name || attr.name.name !== 'path') {
              return;
            }

            const isValid = attr.value.type && attr.value.type === 'StringLiteral';

            if (!isValid) {
              throw new Error(INVALID_PATH_PROP_MSG);
            }

            const resolvedTemplate = noCodeSplitting
              ? NO_CODE_SPLIT_TEMPLATE
              : CODE_SPLIT_TEMPLATE;

            attr.value = t.jSXExpressionContainer( // eslint-disable-line no-param-reassign
              resolvedTemplate({
                SOURCE: t.stringLiteral(attr.value.value),
              }).expression
            );
          });

          // Adds a noCodeSplitting={true|false} prop to the code split component.
          path.node.openingElement.attributes.push(
            t.jSXAttribute(t.jSXIdentifier('noCodeSplitting'),
            t.jSXExpressionContainer(
              (noCodeSplitting ? TRUE() : FALSE()).expression)
            ));
        }
      },
    },
  };
}

module.exports = codeSplitComponentPlugin;
