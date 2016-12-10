# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [2.0.0-alpha.4] - 2016-12-09

### Fixed

Refactors the Webpack plugin so that it no longer breaks sourcemaps.

## [2.0.0-alpha.3] - 2016-12-08

### Breaking Changes

Renames the "role" option on the babel plugin to "mode".

### Changes

Adds some tests for the most complex/critical elements of this package.

Adds a new "defer" prop to the CodeSplit component. This is a boolean flag. If it is `true` then the respective component will NOT be rendered within server side renders, instead deferring to asynchronous resolving and rendering on the client.

Rewrites the webpack plugin so that it no longer creates new ids for modules and chunks, and rather binds a mapping object to the globals.  This allows for a greater degree of interop with other webpack plugins and also provides some nice bundle size savings, especially for larger bundles.

Adds serialize-javascript as a peer dependency.

## [2.0.0-alpha.2] - 2016-11-07

### Fixed

Issues created when a chunk id is a negative number.

## [2.0.0-alpha.0] - 2016-11-07

### Breaking Changes

Complete rewrite! Read the docs. :)

## [1.0.1] - 2016-11-02

### Changed

Updates dependencies.

Changes the engines config in package.json.

## [1.0.0] - 2016-10-14

A complete reimaganing of this library, breaking away from react-modules with it's own identity.  This library will now do code splitting by default using Webpack 2's native APIs and provides the babel plugin to support SSR projects.  Everything works great, HMR and SSR, and it solves all my original problems I set out to meet.  I like that it doesn't need the babel plugin unless you want to upscale into SSR.

## [0.0.4] - 2016-10-13

### Breaking Changes

The "path" prop has been replaced with two new props: "module" and "modules".

The "module" prop requires you to provide a single require('./Foo') statement, whilst the "modules" prop requires you to provide an array containing require statements.  

In the case of "modules" you will receive an array as the value to the callback function you provide as a child to the CodeSplitComponent. Additionally the array result in the callback will contain null values until the modules are fetched from server.  This allows you to do array based destructuring without having to do empty array checks first.

"module" example:

  <Match
    pattern="/about"
    render={() =>
      <CodeSplitComponent module={require('./About')}>
        { About => (About ? <About /> : <div>Loading...</div>) }
      </CodeSplitComponent>
    }
  />

"modules" example:

  <Match
    exactly
    pattern="/"
    render={() =>
      <CodeSplitComponent modules={[require('./Home'), require('./About')]}>
        { ([Home, About]) => (Home && About ? <Home /> : <div>Loading...</div>) }
      </CodeSplitComponent>
    }
  />

## [0.0.3] - 2016-10-12

### Changed

 - Created a whole new repository, breaking away form the fork of [`react-modules`](https://github.com/threepointone/react-modules).  This is so that we can have separate versioning and releases tags.
