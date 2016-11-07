import React from 'react';
import CodeSplit from '../../modules/CodeSplit';

export default (
  <CodeSplit chunkName="bar" modules={{ Foo: require('./Foo') }}>
    { ({ Foo }) => Foo && <Foo /> }
  </CodeSplit>
);
