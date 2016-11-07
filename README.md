# ✂️ code-split-component

Declarative code splitting for your Wepback bundled React projects, with SSR support.

```jsx

import { CodeSplit } from 'code-split-component';

<CodeSplit module={System.import('../Foo')}>
  { Foo => Foo && <Foo /> }
</CodeSplit>
```

---

## TOCs

 - [About](https://github.com/ctrlplusb/code-split-component#about)
 - [Installation](https://github.com/ctrlplusb/code-split-component#installation)
 - [Configuration](https://github.com/ctrlplusb/code-split-component#configuration)
 - [Usage](https://github.com/ctrlplusb/code-split-component#usage)
 - [API](https://github.com/ctrlplusb/code-split-component#api)
 - [Server Side Rendering Usage](https://github.com/ctrlplusb/code-split-component#server-side-rendering-usage)
 - [Combining with React Router 4](https://github.com/ctrlplusb/code-split-component#combining-with-react-router-4)

## About

This library consists of a set of React components, a Webpack plugin, and a Babel 6 plugin - the combination of which allows you to declaratively use Webpack's code splitting feature within your projects without heavy boilerplate code.

## Installation

`npm install code-split-component --save`

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

```js
import CodeSplit from 'code-split-component';

function MyApp() {
  return (
    <div>
      <h1>My App</h1>
      <CodeSplit chunkName="home" modules={{ Home: require('./Home') }}>
        { ({ Home }) => Home && <Home /> }
      </CodeSplit>
    </div>
  );
}
```

Let's break down what is happening within this `CodeSplit` declaration...

As you can see above, you need to provide a `chunkName` prop.  This will be the identifier that is used for the Webpack code split chunk that will be created.

You then also needed to provide an object to the `modules` prop.  You can require multiple modules using this object. Each property key will be used to identify the module with the render ("Home" is the example above) function, and each property value must be a `require` statement containing a string literal (`require('./Home')` in the example above).

Finally, as a child to the `CodeSplit` instance you need to provide a render function.  This function will receive the result of fetching the code split modules from the server and is responsible for producing the respective render output.  It is provided a single parameter - an object that matches the one you provided in the `modules` prop. If a module prop has not yet been resolved from the server it will contain a `null` value, otherwise it will contain the resolved module.  So make sure you always check for nulls.  You can in those cases return nothing or for example a `<Loading />` component.

## API

### Babel Plugin

We will demonstrate the full API for the Babel plugin via the following `.babelrc` configuration, with each option containin the default value assigned.

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

To use the Webpack plugin you need to import it and then pass a new'ed up instance to your Webpack configurataion.  We'll demo the full API within the following Webpack configuration snippet, containing the default values assigned to each option.

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

### CodeSPlit

Used to define a code split point within your application, declaring the modules that should be included within the code split chunk.

We will demonstrate the full API of the `CodeSplit` component via the following example:

```jsx
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
```

Here is a break down of each prop:

  - __`chunkName`__ (string, ___required___) - The name of the chunk that the modules declared within the `modules` should be bundled in to.  This does not need to be unique across all of your `CodeSplit` declarations.  If two or more instances share the same `chunkName` value then all the respective modules for those instances will be contained within the same code split Webpack chunk.
  - __`modules`__ (object, __required__) - The modules to be code split.  Each key/value pair can be described like so:
    - `key` - The identifier used to reference the resolved module within the render function.
    - `value` - A `require` statement containing a `string` literal path to the module you would like to include. Important: You can only provide a string literal as Webpack needs to be able to do static analysis to figure out which modules need to be code split into separate chunks.
  - __`children`__ (function, __required__) - The function used to receive the resolved modules and produce the render result.  It is provided a single parameter - an object which is structurally equivalent to the value provided in the `modules` prop.  This will contain all the resolved modules. If a module has not yet been resolved from the server it will contain a `null` value, otherwise it will contain the actual module.  So make sure you always check for nulls.  You can in those cases return nothing or for example a `<Loading />` component.  The function must return one of the following: a React element, `null`, `undefined`, or `false`.

### CodeSplitProvider

Tracks and manages the required code split state for the `CodeSplit` instances.  This needs to be close to the root level of your application, wrapping your application component.

We will demonstrate the full API of the `CodeSplit` component via the following example:

```jsx
<CodeSplitProvider context={context} state={state}>
  <MyApp />
</CodeSplitProvider>
```

Here is a break down of each prop:

  - __`context`__ (object) - An optional property only needed when in a server side rendering context. This specific property will typically only be used on the server render.  It allows you to pass a `renderContext` instance created by the `createRenderContext` API function (see below).
  - __`state`__ (object) - An optional property only needed in a server side rendering context. This specific property will typically only be used on the client render.  It allows you to rehydrate a known "loaded" chunk/module state that is received from the `rehydrateState` API function (see below).

### createRenderContext (and STATE_IDENTIFIER)

Typically only useful in a server side rendering context, specifically on the server side.

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

### rehydrateState

Typically only useful in a server side rendering context, specifically on the client side.

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

## Server Side Rendering Usage

__TODO__

To see a full example of this I recommend you check out my [`react-universally`](https://github.com/ctrlplusb/react-universally) starter kit. This starter kit provides you with a minimal configuration to get going with a server side rendering React application.

## Combining with React Router

### React Router v2/3

TODO

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

Zing!

___COMING SOON:___ A custom `CodeSplitMatch` component that reduces this boilerplate dramatically.

-------

___Great Appreciation!___

This idea for this library was greatly inspired by Sunil Pai's original work. I highly recommend you go check it out: [`react-modules`](https://github.com/threepointone/react-modules)
