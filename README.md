# code-split-component

A React Component and a Babel 6 plugin to support code splitting in Webpack 2 powered projects.

---

___Confession___

_This work has been completely ripped off from Sunil Pai's (@threepointone) original work. I highly recommend you go see his work before adopting this.  The main differences of this lib compared to his is that this lib is built to target Webpack 2, and is much much much simpler (i.e. severely lacking in features).  I built it to meet a specific use case for my [universal starter kit](https://github.com/ctrlplusb/react-universally)._

_Check out the orignal artwork [here](https://github.com/threepointone/react-modules)._

---

## TOCs

 - [About](https://github.com/ctrlplusb/code-split-component#about)
 - [Dependencies](https://github.com/ctrlplusb/code-split-component#dependencies)
 - [Installation](https://github.com/ctrlplusb/code-split-component#installation)
 - [Using](https://github.com/ctrlplusb/code-split-component#using)
 - [Examples](https://github.com/ctrlplusb/code-split-component#examples)
 - [Caveats / FAQs](https://github.com/ctrlplusb/code-split-component#caveats-faqs)


## About

This library consists of a React Component and a Babel 6 plugin that allows you to declaratively define code split module import points within your React application.

## Dependencies

Your project needs to be using React, Webpack 2 and Babel 6.

## Installation

`npm install code-split-component --save`

## Usage

First you need to add the babel plugin.

```
{
  "plugins": ["code-split-component/babel"]
}
```

Then use the `CodeSplitComponent` within your application to load one of your components.  This component will automatically be used as a code split point.

To do this you have to provide a string literal to the `path` prop of the `CodeSplitComponent`.  This must be a relative path to the component that you are trying to load and have code splitting occur on. NOTE: You can't pass a variable/function etc to resolve the `path` with - it has to be a string literal.

In addition to the `path` prop you need to define a `function` as a child to the `CodeSplitComponent`.  This `function` will receive a single argument, which will be your component.  If the argument is `null` then your component bundle hasn't been fetched from the server yet.

Here is an example:

```jsx
import CodeSplitComponent from 'code-split-component'

<CodeSplitComponent path="../FooComponent">
  { FooComponent => (FooComponent ? <FooComponent /> : <div>Loading...</div>) }
</CodeSplitComponent>
```

## Examples

### Built in Example

There is a React Router 4 based example in the `/example` folder.

Clone this repo and then run the following commands:

```
npm install
npm run example:prod
```

That will run a production build of the code contained within the example folder.  The production build includes the code splitting feature.

For development mode of the example you can run the following command:

```
npm run example:dev
```

Note: in development mode we override the code-split-component babel plugin configuration to disable code splitting.  This is so that we can have a full featured React Hot Loader implementation. It's a seamless transition.

### Universal / Isomorphic Example

This lib was built for use within the [react-universally](https://github.com/ctrlplusb/react-universally) starter kit. This starter kit provides you with a minimal configuration to get going with a server side rendering React application.

I haven't completed the integration of `code-split-component` into the starter kit yet, however, you can preview the current usage within the [`next`](https://github.com/ctrlplusb/react-universally/tree/next) branch.

## Caveats / FAQs

### Hot Reloading

HMR won't work if you have the code splitting enabled. However, there is an easy workaround. Simply update your Babel config and set up the `env` section so that the code splitting will only be enabled for your production build.

e.g.

```
{
  "env": {
    "development": {
      "plugins": [["code-split-component/babel", { "noCodeSplitting": true }]]
    },
    "production": {
      "plugins": ["code-split-component/babel"]
    }
  }
}
```

Remember you need to have set your `NODE_ENV` environment variable to either "development" or "production" for the above to work.
