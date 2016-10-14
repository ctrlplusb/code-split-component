/* eslint-disable new-cap */
/* eslint-disable-line no-param-reassign */

const template = require('babel-template');

// -----------------------------------------------------------------------------
// PRIVATES

const CODE_SPLIT_COMPONENT_NAME = 'CodeSplit';

const MISSING_PROP = 'A "CodeSplit" component must have either a "modules" prop or a "module" prop assigned';

const INVALID_MODULE_PROP_VALUE = `
You must supply a single "System.import" statement containing a string literal to the "module" property of the "CodeSplit" component.

For example:

  <CodeSplit module={System.import('./Foo')}>
    {
      Foo => Foo
        ? <Foo />
        : <span>Loading..</span>
    }
  </CodeSplit>`;

const INVALID_MODULES_PROP_VALUE = `
You must supply an array containing at least one "System.import" statement within to the "modules" prop of the "CodeSplit" component.  Each "System.import" statement within the array must contain a string literal value.

For example:

  <CodeSplit modules={[System.import('./Foo'), System.import('./Bar')]}>
    {
      [Foo, Bar] => Foo && Bar
        ? <div><Foo /><Bar /></div>
        : <span>Loading..</span>
    }
  </CodeSplit>`;

const err = error => `

ERROR IN code-split-component BABEL PLUGIN TRANSPILATION ATTEMPT
----------------------------------------------------------------
${error}

`;

const REQUIRE = template('require(SOURCE)');
const TRUE = template('true');

const isValidPropType = element =>
  element.type
    && element.value.type === 'JSXExpressionContainer'
    && element.value.expression;

const isValidElement = element =>
  element.type === 'CallExpression'
    && element.callee
    && element.callee.type === 'MemberExpression'
    && element.callee.object
    && element.callee.object.name === 'System'
    && element.callee.property
    && element.callee.property.name === 'import'
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
        if (state.opts.enableCodeSplitting) {
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
            const newExpression = REQUIRE({
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
              return REQUIRE({ SOURCE: t.stringLiteral(modulePath) }).expression;
            });

            const newExpression = t.arrayExpression(vals);

            modulesProp.value = t.jSXExpressionContainer(newExpression);

            // Adds a moduleCount={x} prop to the code split component.
            path.node.openingElement.attributes.push(
              t.jSXAttribute(
                t.jSXIdentifier('moduleCount'),
                t.jSXExpressionContainer(t.numericLiteral(count))
              )
            );
          }

          // Adds a transpiled={true|false} prop to the code split component.
          path.node.openingElement.attributes.push(
            t.jSXAttribute(
              t.jSXIdentifier('transpiled'),
              t.jSXExpressionContainer(TRUE().expression)
            )
          );
        }
      },
    },
  };
}

module.exports = codeSplitComponentPlugin;
