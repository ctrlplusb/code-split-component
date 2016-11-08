const transformFileSync = require('babel-core').transformFileSync;
const pathResolve = require('path').resolve;
const modulePathHash = require('../../modules/utils/modulePathHash').default;
const readFileSync = require('fs').readFileSync;

const babelConfig = options => ({
  babelrc: false,
  plugins: [
    'syntax-class-properties',
    'syntax-flow',
    'syntax-jsx',
    [require('../../modules/plugins/babel'), options || {}],
  ],
});

describe('babel plugin', () => {
  const targetPath = pathResolve(__dirname, './_data/codesplit.js');

  it('transpiles when enabled', () => {
    const { code } = transformFileSync(targetPath, babelConfig());

    const expected =
`<CodeSplit chunkName="bar" modules={resolvedModules => require.ensure([], require => resolvedModules({ Foo: require('./Foo') }), "bar")} moduleMap={{
  Foo: "${modulePathHash(pathResolve(__dirname, './_data/Foo'))}"
}}>
  {({ Foo }) => Foo && <Foo />}
</CodeSplit>;`;

    expect(code).toEqual(expected);
  });

  it('does not transpile when disabled', () => {
    const { code } = transformFileSync(targetPath, babelConfig({ disabled: true }));

    const expected = readFileSync(targetPath, 'utf8');

    expect(`${code}\n`).toEqual(expected);
  });

  it('does not transpile "modules" when role="server"', () => {
    const { code } = transformFileSync(targetPath, babelConfig({ role: 'server' }));

    const expected =
`<CodeSplit chunkName="bar" modules={{ Foo: require('./Foo') }} moduleMap={{
  Foo: "${modulePathHash(pathResolve(__dirname, './_data/Foo'))}"
}}>
  {({ Foo }) => Foo && <Foo />}
</CodeSplit>;`;

    expect(code).toEqual(expected);
  });
});
