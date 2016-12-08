/* @flow */

import React from 'react';
import { shallow, mount } from 'enzyme';
import Msgs from '../modules/messages';

// Under test.
import CodeSplit from '../modules/CodeSplit';

describe('CodeSplit', () => {
  // A module stub.
  const PoopModule = () => <div>poop</div>;

  // The time we should mock out for resolving asynchronous modules.
  const asyncResolveTime = 25;

  // Synchrnous modules.
  const syncModules = { Poop: PoopModule };

  // Asynchronous modules.
  const asyncModules = resolvedModules =>
    setTimeout(() => resolvedModules(syncModules), asyncResolveTime);

  const notTranspiledProps = {
    children: ({ Poop }) => Poop && <Poop />,
    chunkName: 'chunky',
    modules: syncModules,
    transpiled: false,
  };

  const transpiledClientProps = {
    children: ({ Poop }) => Poop && <Poop />,
    chunkName: 'chunky',
    moduleMap: { Poop: 'ABC123' },
    modules: asyncModules,
    mode: 'client',
    transpiled: true,
  };

  const transpiledServerProps = {
    children: ({ Poop }) => Poop && <Poop />,
    chunkName: 'chunky',
    moduleMap: { Poop: 'ABC123' },
    modules: syncModules,
    mode: 'server',
    transpiled: true,
  };

  // Generates the required React Context for the component instances.
  const mockContext = () => {
    const registry = {};
    const loadedChunks = [];
    return {
      registerModule: (id, module) => {
        registry[id] = module;
      },
      retrieveModule: id => registry[id],
      registerChunkLoaded: chunkName => loadedChunks.push(chunkName),
    };
  };

  it('errors when not transpiled and modules are async', () => {
    expect(() =>
      shallow(
        <CodeSplit
          {...transpiledClientProps}
          modules={asyncModules}
          transpiled={false}
        />,
        { context: mockContext() },
      ),
    ).toThrow(Msgs.InvalidModulesPropForNotTranspiled);
  });

  it('not transpiled synchronously renders', () => {
    const wrapper = shallow(
      <CodeSplit {...notTranspiledProps} />,
      { context: mockContext() },
    );
    expect(wrapper.find(PoopModule).length).toEqual(1);
    expect(wrapper).toMatchSnapshot();
  });

  it('server synchronously renders', () => {
    const wrapper = shallow(
      <CodeSplit {...transpiledServerProps} />,
      { context: mockContext() },
    );
    expect(wrapper.find(PoopModule).length).toEqual(1);
    expect(wrapper).toMatchSnapshot();
  });

  it('client asynchronously renders', (done) => {
    const wrapper = mount(
      <CodeSplit {...transpiledClientProps} />,
      { context: mockContext() },
    );
    expect(wrapper.find(PoopModule).length).toEqual(0);
    expect(wrapper.html()).toMatchSnapshot();
    setTimeout(() => {
      // Still shouldn't have rendered
      expect(wrapper.html()).toMatchSnapshot();
    }, asyncResolveTime / 2);
    setTimeout(() => {
      // It should have rendered by now.
      expect(wrapper.html()).toMatchSnapshot();
      done();
    }, asyncResolveTime + 5);
  });

  it('defers rendering on server when defer prop set', () => {
    const wrapper = shallow(
      <CodeSplit {...transpiledServerProps} defer />,
      { context: mockContext() },
    );
    expect(wrapper).toMatchSnapshot();
  });
});
