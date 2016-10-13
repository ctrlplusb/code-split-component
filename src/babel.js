/* eslint-disable new-cap */
/* eslint-disable-line no-param-reassign */

// This has been completely stolen from @threepointone's amazing original
// implementation which can be found here:
// https://github.com/threepointone/react-modules
// Go look at his implementation! It is far more featureful.
// All props go to Sunil! Love love love.

const template = require('babel-template');

// -----------------------------------------------------------------------------
// PRIVATES

const CODE_SPLIT_COMPONENT_NAME = 'CodeSplitComponent';

const MISSING_PROP = 'A CodeSplitComponent must have either a "modules" prop or a "module" prop assigned';

const INVALID_MODULE_PROP_VALUE = `
You must supply a single require statement containing a string literal to the "module" property of the "CodeSplitComponent".

For example:

  <CodeSplitComponent module={require('./Foo')}>
    {
      Foo => Foo
        ? <Foo />
        : <span>Loading..</span>
    }
  </CodeSplitComponentLoader>`;

const INVALID_MODULES_PROP_VALUE = `
You must supply an array containing at least one require statement within to the "modules" prop of the "CodeSplitComponent".  Each require statement within the array must have string literal value.

For example:

  <CodeSplitComponent modules={[require('./Foo'), require('./Bar')]}>
    {
      [Foo, Bar] => Foo && Bar
        ? <div><Foo /><Bar /></div>
        : <span>Loading..</span>
    }
  </CodeSplitComponentLoader>`;

const err = error => `

ERROR IN CodeSplitComponent BABEL PLUGIN TRANSPILATION ATTEMPT
--------------------------------------------------------------
${error}

`;

const SYSTEM_IMPORT = template('System.import(SOURCE)');
const PROMISE_ALL = template('Promise.all(SOURCE)');

const TRUE = template('true');

const isValidPropType = element =>
  element.type
    && element.value.type === 'JSXExpressionContainer'
    && element.value.expression;

const isValidElement = element =>
  element.type === 'CallExpression'
  && element.callee
  && element.callee.type === 'Identifier'
  && element.callee.name === 'require'
  && element.arguments
  && element.arguments.length > 0
  && element.arguments[0].type === 'StringLiteral';

const isInvalidElement = element => !isValidElement(element);

const isValidModulesExpression = expression =>
  expression.type === 'ArrayExpression'
    && expression.elements.length > 0
    && expression.elements.findIndex(isInvalidElement) === -1;

// -----------------------------------------------------------------------------
// PLUGIN

function codeSplitComponentPlugin({ types: t }) {
  return {
    visitor: {
      JSXElement(path, state) {
        if (state.opts.noCodeSplitting) {
          return;
        }

        if (path.node.openingElement.name.name === CODE_SPLIT_COMPONENT_NAME) {
          const moduleProp = path.node.openingElement.attributes.find(attr =>
            attr.name && attr.name.name === 'module'
          );

          const modulesProp = path.node.openingElement.attributes.find(attr =>
            attr.name && attr.name.name === 'modules'
          );

          if (!moduleProp && !modulesProp) {
            throw new Error(err(MISSING_PROP));
          }

          if (moduleProp) {
            const expression = moduleProp.value.expression;

            if (!isValidPropType(moduleProp) || !isValidElement(expression)) {
              throw new Error(err(INVALID_MODULE_PROP_VALUE));
            }

            const modulePath = expression.arguments[0].value;
            const newExpression = SYSTEM_IMPORT({
              SOURCE: t.stringLiteral(modulePath),
            }).expression;

            moduleProp.value = t.jSXExpressionContainer(newExpression);
          } else {
            // modules prop

            const expression = modulesProp.value.expression;

            if (!isValidPropType(modulesProp) || !isValidModulesExpression(expression)) {
              throw new Error(err(INVALID_MODULES_PROP_VALUE));
            }

            const requireStatements = expression.elements;
            const count = requireStatements.length;

            const vals = requireStatements.map((moduleRequire) => {
              const modulePath = moduleRequire.arguments[0].value;
              return SYSTEM_IMPORT({ SOURCE: t.stringLiteral(modulePath) }).expression;
            });

            const newExpression = PROMISE_ALL({
              SOURCE: t.arrayExpression(vals),
            }).expression;

            modulesProp.value = t.jSXExpressionContainer(newExpression);

            // Adds a moduleCount={x} prop to the code split component.
            path.node.openingElement.attributes.push(
              t.jSXAttribute(
                t.jSXIdentifier('moduleCount'),
                t.jSXExpressionContainer(t.numericLiteral(count))
              )
            );
          }

          // Adds a noCodeSplitting={true|false} prop to the code split component.
          path.node.openingElement.attributes.push(
            t.jSXAttribute(
              t.jSXIdentifier('codeSplit'),
              t.jSXExpressionContainer(TRUE().expression)
            )
          );
        }
      },
    },
  };
}

module.exports = codeSplitComponentPlugin;
