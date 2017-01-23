# DEPRECATED

In favour of my new [`react-async-component`](https://github.com/ctrlplusb/react-async-component) library that provides a more generic solution that also supports code splitting and React Hot Loader. It also has no dependency on Webpack or Babel, making it more flexible.

-------

# ✂️ code-split-component

Declarative code splitting for your Wepback bundled React projects, with SSR support.

[![npm](https://img.shields.io/npm/v/code-split-component.svg?style=flat-square)](http://npm.im/code-split-component)
[![MIT License](https://img.shields.io/npm/l/code-split-component.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/code-split-component.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/code-split-component)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/code-split-component.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/code-split-component)

```jsx

import { CodeSplit } from 'code-split-component';

<CodeSplit chunkName="foo" modules={{ Foo: require('../Foo') }}>
  { ({ Foo }) => Foo && <Foo /> }
</CodeSplit>
```

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

Here is a live deployment of react-universally, an SSR starter kit that makes use of this library:

https://react-universally.now.sh

Check the network tab to see it in action. :)

## Installation

Note: this library is in alpha status on the v2 rewrite.  Although it's alpha I highly recommend that you install the latest alpha.  The v1 API is considered inefficient and has been deprecated.

```
npm install code-split-component@2.0.0-alpha.5 --save
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

These plugins do not play nicely with the hot module reloading feature of Webpack.  This doesn't mean that you can't use `code-split-component`, but rather that you should disable the plugins for your development environment.  You can do this in two ways, either you exclude the plugins from your Webpack/Babel configuration, or you set the `disabled` option within each plugin to `true`.

When you do this the `CodeSplit` instances will run synchronously, whilst your production builds will still have all the code splitting optimisation that you desire.  Code splitting is essentially a production optimisation (like gzipping or minifying your code), rather than something that is required for development.

Below is an example of how to use the `disabled` options on each of the respective plugins::

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

To use this library within a SSR application it is required that you use Webpack to bundle both the client and server.  This is because this module and it's plugins relies on API features that are only made available within a Webpack bundle context.

Okay, with that being said you will generally have two sets of Webpack/Babel configurations: for the client and server.  

### Client configuration

You can set up your client exactly as shown in the ["Usage"](https://github.com/ctrlplusb/code-split-component#usage) section above, however there is one small modification required.  The server bundle will typically return a response that will include a `window` bound state object indicating which of the chunks/modules were used whilst server rendering a specific HTTP request.  We need to make sure that we use the provided state to bootstrap our client application so that it starts with the same expected chunks/modules required to full represent the server rendered React application.

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

That is the only required change compared to a client-only configuration.

### Server configuration

As stated above it is a requirement that your server bundle is bundled using Webpack.

Within your server's bundling configuration you need to make sure that it includes both the provided Webpack and Babel plugins.  The Webpack plugin can use the standard/default options, however, the Babel plugin needs to be configured slightly differently for the server bundle.  Specifically, you need to to make sure you set the value of the `mode` option for the plugin to `"server"`.

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
              mode: 'server' // IMPORTANT for the server bundle! Not needed for the client bundle.
            }]
          ]
        }
      }
    ]
  }
}
```

As you can see above the important bit is setting `mode='server'`.  Setting this value ensures that our `CodeSplit` instances will be synchronously resolved and rendered on the server so that we get a "full render" result for each HTTP request.  This is technically the only difference in the Webpack/Babel plugin configurations between the client and server.

Ok, with the configuration complete you need to update your middleware used to render the React application to be similar to the following:

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

When doing a server render it is possible to calculate and embed all the required script/style tags representing each chunk that was used when servicing an HTTP request.  This would then allow the user's browser to asynchronously (and in parallel) download the chunk scripts/styles whilst the JS is being parsed by the browser.  This results in a nice little extra performance gain if you are after such things. :)

This isn't a requirement of course, the `rehydrateState` helper will make sure all the required chunk files are fetched.

If you are interested in the additional performance gain, you could do something like the following:

The [`assets-webpack-plugin`](https://github.com/kossnocorp/assets-webpack-plugin) outputs a JSON file that details all of the chunks for a Webpack build.  We could use this information along with the code split render context to resolve the paths to the js/css files that we should include for the HTTP request being serviced.

I am not going to provide a full code example code here, but the [`react-universally`](https://github.com/ctrlplusb/react-universally/blob/master/src/server/middleware/reactApplication/generateHTML.js#L67) starter kit contains an example of this optimisation.

The solution is quite trivial when you see it. :)

### Full SSR Example

SSR is always quite an involved process.  I highly recommend that you check out the [`react-universally`](https://github.com/ctrlplusb/react-universally) starter kit to get a full featured reference implementation.

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
      // For your server bundle you need to specify this value as being "server".  
      // This will ensure that server side rendering will synchronously execute,
      // allowing us to get as much out of our server render as possible.  
      // NOTE: It isn't good enough to just set "disabled: true" for the server
      // builds as there are other important mechanisms of the plugin that we
      // need to be able to support rehydrating of the code split state on the
      // client.
      "mode": "client"
    }]
  ]
}
```

### Webpack Plugin

The Webpack plugin allow us to more resolve the chunks and modules generated by Webpack.

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
  <CodeSplit chunkName="home" modules={{ Home: require('./Home') }} defer={false}>
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
  - __`defer`__ (boolean, __optional__) - This flag is only useful when you have a server side rendered React application.  Setting this flag to `true` will indicate to the server that it should not resolve and render the specific `CodeSplit` instance, and that rendering should instead be deferred to the browser render.  This can be a good optimisation strategy to avoid rendering sub sections of your application that have a heavy dependency on javascript powered controls - a server rendered app produces UI fast, but until the JS is fully parsed by the browser the JS dependant controls won't be useable.  Therefore deferring parts of your application can be a wise decision.  You will still get a rendered shell which will give the user a good perceived performance.

### `CodeSplitProvider`

Tracks and manages the required code split state for the `CodeSplit` instances.  This needs to be close to the root level of your application, wrapping your React application component.

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
