import { transformFileSync } from 'babel-core';
import { resolve as pathResolve } from 'path';
import { modulePathHash } from '../../src/utils';

const babelConfig = options => ({
  babelrc: false,
  plugins: [
    'syntax-class-properties',
    'syntax-flow',
    'syntax-jsx',
    [require('../../src/plugins/babel'), options || {}],
  ],
});

describe('babel plugin', () => {
  const targetPath = pathResolve(__dirname, './_data/codesplit.js');

  it('transpiles', () => {
    const { code } = transformFileSync(targetPath, babelConfig());
    const expectedModuleHash = modulePathHash(pathResolve(__dirname, './_data/Foo'));
    expect(code).toContain(`Foo: "${expectedModuleHash}"`);
    expect(code).toMatchSnapshot();
  });

  it('does not transpile when disabled', () => {
    const { code } = transformFileSync(
      targetPath,
      babelConfig({ disabled: true }),
    );
    expect(code).toMatchSnapshot();
  });

  it('does not transpile "modules" when mode="server"', () => {
    const { code } = transformFileSync(
      targetPath,
      babelConfig({ mode: 'server' }),
    );
    expect(code).toMatchSnapshot();
  });
});
