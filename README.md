# ✂️ code-split-component

Declarative code splitting for your Wepback bundled React projects, with SSR support.

```jsx

import { CodeSplit } from 'code-split-component';

<CodeSplit chunkName="foo" modules={{ Foo: require('../Foo') }}>
  { ({ Foo }) => Foo && <Foo /> }
</CodeSplit>
```

---

## TOCs

 - [About](https://github.com/ctrlplusb/code-split-component#about)
 - [Demo](https://github.com/ctrlplusb/code-split-component#demo)
 - [Installation](https://github.com/ctrlplusb/code-split-component#installation)
 - [Configuration](https://github.com/ctrlplusb/code-split-component#configuration)
 - [Usage](https://github.com/ctrlplusb/code-split-component#usage)
 - [Server Side Rendering Usage](https://github.com/ctrlplusb/code-split-component#server-side-rendering-usage)
 - [API](https://github.com/ctrlplusb/code-split-component#api)
 - [Combining with React Router](https://github.com/ctrlplusb/code-split-component#combining-with-react-router)

## About

This library consists of a set of React components, a Webpack plugin, and a Babel 6 plugin - the combination of which allows you to declaratively use Webpack's code splitting feature within your projects without heavy boilerplate code.

## Demo

Here is an example of react-universally, an SSR starter kit that makes use of this library:

https://react-universally-jjnlcdmaxy.now.sh

## Installation

Note: this library is in alpha status on the v2 rewrite.  Although it's alpha I highly recommend that you install the latest alpha.  The v1 API is considered inefficient and has been deprecated.

```
npm install code-split-component@2.0.0-alpha.2 --save
```

## Configuration

Before you can use the components, you need to add the Babel and Webpack plugins to your build configuration.

Firstly add the Webpack plugin to your Webpack configuration like so:

```js
import CodeSplitWebpackPlugin from 'code-split-component/webpack';

const webpackConfig = {
  plugins: [
    new CodeSplitWebpackPlugin(),
  ]
}
```

And then add the Babel plugin to your `.babelrc` like so:

```json
{
  "plugins": ["code-split-component/babel"]
}
```

### Caveats

__Hot Module Reloading__

These plugins do not play nicely with the hot module reloading feature of Webpack.  This doesn't mean that you can't use `code-split-component`, but rather that you should set the plugins as being disabled for your development environment.

This means that for your development builds the `CodeSplit` instances will run synchronously, whilst your production builds will still have all the code splitting optimisation that you desire.  Try to see code splitting as a production optimisation (like gzipping or minifying your code), rather than something that is required in development.

To do this firstly modify your Webpack configuration to look something similar to:

```js
import CodeSplitWebpackPlugin from 'code-split-component/webpack';

const webpackConfig = {
  plugins: [
    new CodeSplitWebpackPlugin({
      // The code-split-component doesn't work nicely with hot module reloading,
      // which we use in our development builds, so we will disable it if we
      // are creating a development bundle (which results in synchronous loading
      // behavior on the CodeSplit instances).
      disabled: process.env.NODE_ENV === 'development',
    }),
  ]
}
```

And then modify your `.babelrc` to look similar to:

```js
{
  "plugins": ["code-split-component/babel"],
  "env": {
    // Overrides for our development environment
    "development": {
      "plugins": [  
        // The code-split-component doesn't work nicely with hot
        // module reloading, which we use in our development builds,
        // so we will disable it (which results in synchronous loading
        // behavior on the CodeSplit instances).
        ["code-split-component/babel", {
          "disabled": true
        }]
      ]
    }
  }
}
```

## Usage

After you have [configured](https://github.com/ctrlplusb/code-split-component#configuration) your application correctly you can then use the React components provided.

Firstly, you need to wrap your entire application with the `CodeSplitProvider`.

```jsx
import { CodeSplitProvider } from 'code-split-component';

ReactDOM.render(
  <CodeSplitProvider>
    <MyApp />
  </CodeSplitProvider>,
  document.getElementById('app')
);
```

Now, with your application you make use of the `CodeSplit` component to declare pieces of your application that you wish to be split into separate chunks by Webpack.  When run on the code split modules will be resolved asynchronously.

```jsx
import { CodeSplit } from 'code-split-component';

function MyApp() {
  return (
    <div>
      <h1>My App</h1>
      <CodeSplit chunkName="home" modules={{ Home: require('./Home') }}>
        {
          function render(modules) {
            const { Home } = modules;
            return Home
              ? <Home />
              : <div>Loading...</div>;
          }
        }
      </CodeSplit>
    </div>
  );
}
```

Let's break down what is happening within this `CodeSplit` declaration...

As you can see above, you need to provide a `chunkName` prop.  This will be the identifier that is used for the Webpack code split chunk that will be created.

The `modules` prop contains an object defining all the modules to include in the chunk.

Finally, as a child to the `CodeSplit` instance you need to provide a render function.  This function will receive the result of resolving the code split modules from the server and is responsible for returning the render output.  It is provided a single parameter - an object whose shape matches the one you provided in the `modules` prop. If the modules have not been resolved from the server yet (it's an async operation) then each property will contain a `null` value, otherwise they will contain their respective resolved module.  So make sure you always check for nulls.  You can in those cases return nothing or for example a `<Loading />` component.  The above example may look a bit verbose, but I wanted to make it absolutely clear what was going on.  You can use ES6 features to create a more concise version:

```jsx
<CodeSplit chunkName="home" modules={{ Home: require('./Home') }}>
  { ({ Home }) => Home ? <Home /> : <div>Loading...</div> }
</CodeSplit>
```

## Server Side Rendering Usage

To use this library within a SSR application it is required that you use Webpack to bundle both the client and server (or at least the universal middleware used to render your React application).  This is because this library relies on API features only available within a Webpack bundle context in order to dynamically track/load the chunks/modules.

You are typically going to have two sets of configurations.  A client and server configuration.  

### Client configuration

You can set up your client exactly as shown in the ["Usage"](https://github.com/ctrlplusb/code-split-component#usage) section above, however there is one small modification required.  The server bundle will typically return a response that contains a state object indicating which chunks/modules were used whilst server rendering your application.  We want to make sure that we bootstrap our client so that it starts with the same expected chunks/modules ready and loaded.

To do this we make use of the `rehydrateState` API function (see the docs above).  Here is an example of this:

```js
import { CodeSplitProvider, rehydrateState } from 'code-split-component';
import ReactDOM from 'react-dom';
import MyApp from './components/MyApp';

rehydrateState().then(codeSplitState =>
  ReactDOM.render(
    <CodeSplitProvider state={codeSplitState}>
      <MyApp />
    </CodeSplitProvider>,
    document.getElementById('app')
  )
);
```

That is the only difference compared to a client-only configuration.

### Server configuration

As stated above it is a requirement that your server bundle (or at least the universal middleware used to render your React application) is bundled using Webpack.

Within your server's configuration you need to make sure it includes both the provided Webpack and Babel plugins.  The Webpack plugin can use the standard/default options, however, the Babel plugin needs to be configured slightly differently for the server bundle.  Specifically, you need to to make sure you set the "role" option for the plugin to "server".

Below is an example Webpack configuration, within which we have provided the Babel options directly to the babel-loader.  This then demonstrates the full configuration requirements for a server bundle:

```js
import CodeSplitWebpackPlugin from 'code-split-component/webpack';

const webpackConfig = {
  plugins: [
    new CodeSplitWebpackPlugin(),
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: {
          plugins: [
            // Our babel plugin.
            ['code-split-component/babel', {
              role: 'server' // IMPORTANT!
            }]
          ]
        }
      }
    ]
  }
}
```

As you can see above the important bit is setting `role='server'`.  Setting this value ensures that our `CodeSplit` instances are resolved synchronously so that we get a "full render" result for each server request.  This is technically the only difference in the Webpack/Babel plugin configurations between the client and server.

Ok, with the configuration complete you need to update your middleware used to render the application to be similar to the following:

```jsx
import { CodeSplitProvider, createRenderContext, STATE_IDENTIFIER } from 'code-split-component';
import { renderToString } from 'react-dom/server';
import serialize from 'serialize-javascript';

function expressMiddleware(req, res) {
  // We create a context for our <CodeSplitProvider> which will allow us
  // to query which chunks/modules were used during the render process.
  const codeSplitContext = createRenderContext();

  // Wrap the application with the CodeSplitProvider and render it
  // to a string as is normal in an SSR execution.
  const appString = renderToString(
    <CodeSplitProvider context={codeSplitContext}>
      <MyApp />
    </CodeSplitProvider>
  );

  // Send back the result.
  res.status(200).send(`
    <html>
      <head>...</head>
      <body>
        <div id="app">{appString}</div>

        <script type="text/javascript">
           // IMPORTANT!
           // Binding our code split context state to a window instance
           // which will allow our client bundle to efficiently bootstrap.
           window.${STATE_IDENTIFIER} = ${serialize(codeSplitContext.getState();)}
        </script>
      </body>
    </html>
  `)
}
```

That's it. You can use the standard `CodeSplit` component API, even for an SSR application.

### Going one step further - a nice optimisation.

When doing a server render it is possible to calculate and embed all the required script/style tags for each chunk that was loaded for a request.  This would then allow our client to be asynchronously download the required chunk scripts/styles whilst the JS is being parsed.

This isn't a requirement, our `rehydrateState` function does take of fetching any chunk files that need to be fetched, however it could translate to some nice little performance wins.

The [`assets-webpack-plugin`](https://github.com/kossnocorp/assets-webpack-plugin) can used to help us achieve this.  This plugin outputs a JSON file that represents each chunk included within our bundle along with the paths to the associated js/css files for each chunk.  When combining this with the `.getState()` call on our render context we can marry up the loaded bundles to this JSON file in order to determine which js/css files we should include.

I am not going to provide example code here, but my [`react-universally`](https://github.com/ctrlplusb/react-universally/blob/master/src/universalMiddleware/index.js) start kit contains an example of this optimisation.

The solution is quite trivial when you see it. :)

### Full SSR Example

SSR is always quite an involved process.  I highly recommend that you check out my [`react-universally`](https://github.com/ctrlplusb/react-universally) starter kit to get a full featured reference implementation.

## API

### Babel Plugin

The babel plugin does all the heavy lifting for you, transpiling your `CodeSplit` instances into a required format to support the code splitting feature.  It saves you from a lot of boilerplate overhead.

We will demonstrate the full API for the Babel plugin via the following `.babelrc` configuration, with each option containing the default value assigned.

```js
{
  "plugins": [
    ["code-split-component/babel", {
      // OPTIONS

      // This is useful in a couple of scenarios:
      //  - You don't want to use the code splitting feature any more, but don't
      //    want to have to update all your code.
      //  - You are using Webpack's "hot module reloading" feature, which is not
      //    supported by this plugin
      "disabled": false,

      // This is useful when using the plugin in a "server side rendering" context.
      // For your server bundle / universal react app middleware you need to specify
      // this value as being "server".  This will ensure that server side rendering
      // will asynchronously execute, allowing us to get as much out of our server
      // render as possible.  
      // NOTE: It isn't good enough to just set "disabled: true" for the server
      // builds as there are other important mechanisms of the plugin that we will
      // use for client side state rehydration.
      "role": "client"
    }]
  ]
}
```

### Webpack Plugin

The Webpack plugin modifies the Webpack bundling system to allow us to much more easily track/resolve chunks and their respective modules - a requirement for getting our code split components to work.

To use the Webpack plugin you need to import it and then pass a new'ed up instance to your Webpack configuration.  We'll demo the full API within the following Webpack configuration snippet, containing the default values assigned to each option.

```js
import CodeSplitWebpackPlugin from 'code-split-component/webpack';

const webpackConfig = {
  plugins: [
    new CodeSplitWebpackPlugin({
      // This is useful in a couple of scenarios:
      //  - You don't want to use the code splitting feature any more, but don't
      //    want to have to update all your code.
      //  - You are using Webpack's "hot module reloading" feature, which is not
      //    supported by this plugin
      disabled: false
    })
  ]
};
```

### `CodeSplit`

Used to define a code split point within your application, declaring the modules that should be included within the code split chunk.

We will demonstrate the full API of the `CodeSplit` component via the following example:

```jsx
import { CodeSplit } from 'code-split-component';

return (
  <CodeSplit chunkName="home" modules={{ Home: require('./Home') }}>
    {
      function render(modules) {
        const { Home } = modules;
        return Home
          ? <Home />
          : <div>Loading...</div>;
      }
    }
  </CodeSplit>
);
```

Here is a break down of each prop:

  - __`chunkName`__ (string, ___required___) - The name of the chunk that the modules declared within the `modules` should be bundled in to.  This does not need to be unique across all of your `CodeSplit` declarations.  If two or more instances share the same `chunkName` value then all the respective modules for those instances will be contained within the same code split Webpack chunk.
  - __`modules`__ (object, __required__) - The modules to be code split.  Each key/value pair can be described like so:
    - `key` - The identifier used to reference the resolved module within the render function.
    - `value` - A `require` statement containing a `string` literal path to the module you would like to include. Important: You can only provide a string literal as Webpack needs to be able to do static analysis to figure out which modules need to be code split into separate chunks.
  - __`children`__ (function, __required__) - The function used to receive the resolved modules and produce the render result.  It is provided a single parameter - an object which is structurally equivalent to the value provided in the `modules` prop.  This will contain all the resolved modules. If a module has not yet been resolved from the server it will contain a `null` value, otherwise it will contain the actual module.  So make sure you always check for nulls.  You can in those cases return nothing or for example a `<Loading />` component.  The function must return one of the following: a React element, `null`, `undefined`, or `false`.

### `CodeSplitProvider`

Tracks and manages the required code split state for the `CodeSplit` instances.  This needs to be close to the root level of your application, wrapping your application component.

We will demonstrate the full API of the `CodeSplit` component via the following example:

```jsx
import { CodeSplitProvider } from 'code-split-component';

return (
  <CodeSplitProvider context={context} state={state}>
    <MyApp />
  </CodeSplitProvider>
);
```

Here is a break down of each prop:

  - __`context`__ (object) - An optional property only needed when in a server side rendering application. This specific property will typically only be used on the server render.  It allows you to pass a `renderContext` instance created by the `createRenderContext` API function (see below).
  - __`state`__ (object) - An optional property only needed in a server side rendering application. This specific property will typically only be used on the client render.  It allows you to rehydrate a known "loaded" chunk/module state that is received from the `rehydrateState` API function (see below).

### `createRenderContext` (and `STATE_IDENTIFIER`)

Typically only useful in a server side rendering application, specifically on the server side.

It is used to create a "render context" to provide as the `context` prop on the `CodeSplitProvider` instance.  After an your application has been rendered into a string (as is typical for a SSR app) you can execute the `getState` function on the context instance in order to get a state object that represents the chunks/modules that were loaded in the given request.  This is useful to then bind the response that gets sent to the client so that the client application can rehydrate it's state appropriately, ensuring that the React checksums are maintained and that no unnecessary double rendering occurs.

Here is a snippet example of its usage:

```jsx
import { CodeSplitProvider, createRenderContext, STATE_IDENTIFIER } from 'code-split-component';
import { renderToString } from 'react-dom/server';
import serialize from 'serialize-javascript';

function expressMiddleware(req, res) {
  // We also create a context for our <CodeSplitProvider> which will allow us
  // to query which chunks/modules were used during the render process.
  const codeSplitContext = createRenderContext();

  const appString = renderToString(
    <CodeSplitProvider context={codeSplitContext}>
      <MyApp />
    </CodeSplitProvider>
  );

  res.status(200).send(`
    <html>
      <head>...</head>
      <body>
        <div id="app">{appString}</div>

        <script type="text/javascript">
           // Binding our code split context state will allow
           // efficient client app bootstrapping.
           window.${STATE_IDENTIFIER} = ${serialize(codeSplitContext.getState();)}
        </script>
      </body>
    </html>
  `)
}
```

### `rehydrateState`

Typically only useful in a server side rendering application, specifically on the client side.

This is used to create a rehydrated state, based on the state object that was bound by the server (see the `createRenderContext` API function docs above), to provide to the `CodeSplitProvider` instance that wraps our application.

It is a parameterless function that returns a promise resolving to the rehydrated state object.

Here is a snippet example:

```js
import { CodeSplitProvider, rehydrateState } from 'code-split-component';

rehydrateState().then(codeSplitState =>
  ReactDOM.render(
    <CodeSplitProvider state={codeSplitState}>
      <MyApp />
    </CodeSplitProvider>,
    document.getElementById('app')
  )
);
```

## Combining with React Router

### React Router v2/3

You could create a wrapping functional component to represent each of your code split route components.

For e.g.

```js
import App from './components/App';
import { CodeSplit } from 'code-split-component';

function CodeSplitAbout(routerProps) {
  return (
    <CodeSplit chunkName="about" modules={{ About: require('./components/About') }}>
      { ({ About }) => About && <About {...routerProps} /> }
    </CodeSplit>
  )
}

const router = (
  <Router>
    <Route path="/" component={App}>
      <Route path="about" component={CodeSplitAbout} />
    </Route>
  </Router>
);
```

### React Router v4

You can easily combine React Router 4's declaritive API with this one to get code split routes:

```jsx
<Match
  pattern="/about"
  render={routerProps =>
    <CodeSplit chunkName="about" modules={{ About: require('./About') }}>
      { ({ About }) => About && <About {...routerProps} /> }
    </CodeSplit>
  }
/>
```

___COMING SOON:___ A custom `CodeSplitMatch` component that reduces this boilerplate dramatically.

-------

## Great Appreciation!

This idea for this library was greatly inspired by Sunil Pai's original work. I highly recommend you go check it out: [`react-modules`](https://github.com/threepointone/react-modules)

This guy is full of amazing ideas.  All credit for this library truly goes his way. Accredited within the licence. x
