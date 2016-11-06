/* @flow */

function createServerRenderContext() {
  const chunks = new Set();
  const modules = new Set();

  const registerChunk = (chunkName: string) => chunks.add(chunkName);
  const registerModule = (moduleId: string) => modules.add(moduleId);

  const getRehydrationState = () => ({
    modules: [...modules],
  });

  return {
    registerChunk,
    registerModule,
    getRehydrationState,
  };
}

export default createServerRenderContext;
