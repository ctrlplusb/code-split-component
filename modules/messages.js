/* @flow */

function verboseMessage(body) {
  return `
================================================================================
code-split-component
--------------------------------------------------------------------------------
${body}
================================================================================
`;
}

// We use environment checking so that we can provide verbose messages for
// development that can be dead code elimnated out of production builds.
export default process.env.NODE_ENV === 'development'
  ? {
    HMRNotSupported: verboseMessage(`
Sorry, code-split-component does not support hot module reloading.

If you wish to use it in a hot relaoading environment please set the 'disabled'
option on both the babel and webpack plugins to true.  This will force the
code-split-component instances to work in a synchronous manner that is friendlier
to development and hot reloading environments.  Code splitting is a production
based optimisation, so hopefully this is not an issue for you.

e.g.

const webpackConfig = {
  plugins: [
    new CodeSplitWebpackPlugin({
      // The code-split-component doesn't work nicely with hot module reloading,
      // which we use in our development builds, so we will disable it (which
      // ensures synchronously behaviour on the CodeSplit instances).
      disabled: process.env.NODE_ENV === 'development',
    }),
  ],
  module: {
    rules: [
      {
        test: 'js',
        loader: 'babel',
        query: {
          plugins: [
            [
              'code-split-component/babel',
              {
                // The code-split-component doesn't work nicely with hot
                // module reloading, which we use in our development builds,
                // so we will disable it (which ensures synchronously
                // behaviour on the CodeSplit instances).
                disabled: process.env.NODE_ENV === 'development',
              },
            ],
          ]
        }
      }

    ]
  }
}
`),
    InvalidModulesPropForClient: verboseMessage(`
A client rendered code-split-component should have a generated function that asynchronously resolves the modules assigned to the "modules" prop. The transpilation process appears to have failed.  Please ensure that you have the babel plugin enabled, with the correct "mode" option set (for a browser target the mode should be "client").
`),
    InvalidModulesPropForServer: verboseMessage(`
A client rendered code-split-component should have the originally provided synchronous module map assigned to the "modules" prop. The transpilation process appears to have failed.  Please ensure that you have the babel plugin enabled, with the correct "mode" option set (for a node target the mode should be "server").
`),
    InvalidModulesPropForNotTranspiled: verboseMessage(`
A code-split-component with code splitting disabled should have the originally provided synchronous module map assigned to the "modules" prop.
`),
  }
  // Optimised messages.
  : {
    HMRNotSupported: 'HMR not supported',
    InvalidModulesPropForClient: '"modules" prop invalid',
    InvalidModulesPropForServer: '"modules" prop invalid',
    InvalidModulesPropForNotTranspiled: '"modules" prop invalid',
  };
