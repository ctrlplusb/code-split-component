<CodeSplit chunkName="bar" modules={{ Foo: require('./Foo') }}>
  {({ Foo }) => Foo && <Foo />}
</CodeSplit>;
