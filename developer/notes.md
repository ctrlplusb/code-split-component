## Client Side

### `CodeSplitProvider`

 - The chunk registry isn't useful.
 - The module registry is useful to prevent asynchronous renders after the first render of a component (this is because we will have the already loaded and rendered module in the registry).

# Server Side

### `CodeSplitProvider`

 - We need the chunk and module registry to know which chunks and modules were rendered for a request.  We then need to create a mapping of the respective chunk/module Webpack ids to our hashed versions.  This mapping data needs to be returned to the client so that it can be given to the rehydrateState script, which will fetch and register the required modules/chunks. Therefore the Webpack plugin is technically only required for the "server" build of SSR applications.
 - We only need to create hashes for modules, as we use a module's path to create a unique identifier.  We don't want this exposed to clients.  For chunks we can just use the chunk name in the map.
