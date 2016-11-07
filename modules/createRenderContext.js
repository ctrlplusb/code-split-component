/* @flow */

function createRenderContext() {
  const chunks = new Set();
  const modules = new Set();

  const registerChunk = (chunkName: string) => chunks.add(chunkName);
  const registerModule = (moduleId: string) => modules.add(moduleId);

  const getState = () => ({
    // $FlowFixMe
    chunks: [...chunks],
    // $FlowFixMe
    modules: [...modules],
  });

  return {
    registerChunk,
    registerModule,
    getState,
  };
}

export default createRenderContext;
