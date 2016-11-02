# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

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
