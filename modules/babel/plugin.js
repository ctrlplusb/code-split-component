/* eslint-disable no-console */
/* eslint-disable new-cap */
/* eslint-disable-line no-param-reassign */

import template from 'babel-template';
import nodePath from 'path';
import modulePathHash from '../utils/modulePathHash';

// -----------------------------------------------------------------------------
// PRIVATES

const CODE_SPLIT_COMPONENT_NAME = 'CodeSplit';

const INVALID_PROPS = `
Invalid props provided to a CodeSplit component.

A "chunkName" prop must be provided.  This should be a string literal containing alphanumeric characters only.

A "modules" prop must be provided, and must contain an object literal that has a minimum of one property. Each property should be assigned a "require" statement which has a string literal within.

For example:

  <CodeSplit chunkName="foo" modules={{ Foo: require('./Foo') }>
    { ({ Foo }) => Foo && <Foo /> }
  </CodeSplit>`;

function err(error) {
  throw new Error(`\n
ERROR IN code-split-component BABEL PLUGIN TRANSPILATION ATTEMPT
----------------------------------------------------------------
${error}\n`);
}

const modulesTemplate = template(`resolvedModules => require.ensure(
  [],
  require => resolvedModules(REQUIRES),
  CHUNKNAME
)`);

function getProp(props, propName) {
  return props.find(prop => prop.name.name === propName);
}

function validateProps(chunkName, modules) {
  const isValidModuleProperty = element =>
    element.type === 'ObjectProperty'
      && element.value.type === 'CallExpression'
      && element.value.callee.name === 'require'
      && element.value.arguments.length > 0
      && element.value.arguments[0].type === 'StringLiteral';

  const isInvalidModuleProperty = element => !isValidModuleProperty(element);

  const valid =
    chunkName
    && chunkName.value.type === 'StringLiteral'
    && modules
    && modules.value.type === 'JSXExpressionContainer'
    && modules.value.expression.type === 'ObjectExpression'
    && modules.value.expression.properties.findIndex(isInvalidModuleProperty) === -1;

  if (!valid) {
    err(INVALID_PROPS);
  }
}

// -----------------------------------------------------------------------------
// PLUGIN

function codeSplitBabelPlugin({ types: t }) {
  return {
    visitor: {
      JSXElement(path, state) {
        if (state.opts.target === 'node') {
          // For a node target we don't want to transpile the modules into
          // asynchronous code.
          return;
        }

        if (path.node.openingElement.name.name === CODE_SPLIT_COMPONENT_NAME) {
          const props = path.node.openingElement.attributes;
          const chunkNameProp = getProp(props, 'chunkName');
          const modulesProp = getProp(props, 'modules');

          validateProps(chunkNameProp, modulesProp);

          // -------------------------------------------------------------------
          // Convert the modules into our required async format

          modulesProp.value = t.jSXExpressionContainer(
            modulesTemplate({
              REQUIRES: t.objectExpression(modulesProp.value.expression.properties),
              CHUNKNAME: t.stringLiteral(chunkNameProp.value.value),
            }).expression
          );

          // -------------------------------------------------------------------
          // Add the moduleMap

          // This is the base path from which the require statements will be
          // getting resolved against.
          const basePath = nodePath.dirname(state.file.opts.filename);

          const requireProperties = modulesProp
            .value.expression.body.arguments[1].body.arguments[0].properties;
          const moduleMapProperties = requireProperties.map(moduleRequire =>
            t.objectProperty(
              t.identifier(moduleRequire.key.name),
              t.stringLiteral(
                modulePathHash(nodePath.resolve(basePath, moduleRequire.value.arguments[0].value))
              )
            )
          );

          path.node.openingElement.attributes.push(
            t.jSXAttribute(
              t.jSXIdentifier('moduleMap'),
              t.jSXExpressionContainer(t.objectExpression(moduleMapProperties))
            )
          );
        }
      },
    },
  };
}

module.exports = codeSplitBabelPlugin;
