# ✂️ code-split-component ✂️

A React Component and a Babel 6 plugin to support code splitting in Webpack 2 powered projects.

```jsx

import CodeSplit from 'code-split-component'

<CodeSplit module={require('../Foo')}>
  { Foo => (Foo ? <Foo /> : <div>Loading...</div>) }
</CodeSplit>
```


---

___Confession___

_This work has been completely ripped off from Sunil Pai's (@threepointone) original work. I highly recommend you go see his work before adopting this.  The main differences of this lib compared to his is that this lib is built to target Webpack 2, and is much much much simpler (i.e. severely lacking in features).  I built it to meet a specific use case for my [universal starter kit](https://github.com/ctrlplusb/react-universally)._

_Check out the original artwork [here](https://github.com/threepointone/react-modules)._

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

Then use the `CodeSplit` component within your application to load module(s).  This module(s) will automatically be used as a code split point by your Webpack 2 bundling process.

You must provide either a "module" or "modules" prop to the `CodeSplit` component. The "module" prop must contain a `require` statement with a string literal (e.g. `require('./Foo')`), whilst the "modules" prop must have an array of `require` statements each with a string literal value.  

___NOTE:___ The paths contained within the `require` statements MUST be string literals. You can't pass a variable or a function that resolves to a variable to the require statements as Webpack needs string literals in order to do correct module analysis/resolving for the code splitting procedure to work.

In addition to the `module`/`modules` prop you need to define a callback `function` as a child to the `CodeSplit` component.  This `function` will receive a single argument and should return whatever you would like to be rendered (or null if not).  

If you used the `module` prop the argument to the callback will be your module.  If the module hasn't been fetched from the server yet it will be null.

If you used the `modules` prop then you will get an array that will be the same length as the arguments you provided to the `modules` prop.  If the modules haven't been fetched from the server yet then each position within the array will contain nulls.  Once all the modules have been fetched the array will contain the resolved modules and they will be in the same array index as specified within the `modules` prop.

__NOTE:__ We provide an array initialized with null values as this makes destructuring far easier to use against it, without having the need to do empty array checks.  See the examples.

__"module" example:__

```jsx
import CodeSplit from 'code-split-component'

<CodeSplit module={require('../Foo')}>
  { Foo => (Foo ? <Foo /> : <div>Loading...</div>) }
</CodeSplit>
```

__"modules" example:__

```jsx
import CodeSplit from 'code-split-component'

<CodeSplit modules={[require('./Foo'), require('./Bar')]}>
  { ([Foo, Bar]) => (Foo && Bar ? <div><Foo /><Bar /></div> : <div>Loading...</div>) }
</CodeSplit>
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
