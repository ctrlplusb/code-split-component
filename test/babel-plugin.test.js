const transformFileSync = require('babel-core').transformFileSync;
const pathResolve = require('path').resolve;
const { expect } = require('chai');
const modulePathHash = require('../modules/utils/modulePathHash').default;

const babelConfig = {
  babelrc: false,
  plugins: [
    'syntax-class-properties',
    'syntax-flow',
    'syntax-jsx',
    [require('../modules/babel/plugin')],
  ],
};

describe('babel plugin', () => {
  it('cases', () => {
    const { code } = transformFileSync(
      pathResolve(__dirname, './cases/browser-codesplit.js'),
      babelConfig
    );
    const expected = `import React from 'react';
import CodeSplit from '../../modules/CodeSplit';

export default <CodeSplit chunkName="bar" modules={resolvedModules => require.ensure([], require => resolvedModules({ Foo: require('./Foo') }), 'bar')} moduleMap={{
  Foo: '${modulePathHash(pathResolve(__dirname, './cases/Foo'))}'
}}>
    {({ Foo }) => Foo && <Foo />}
  </CodeSplit>;`;
    expect(expected).equal(code);
  });
});
