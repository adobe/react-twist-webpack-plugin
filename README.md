# Webpack Plugin for React-Twist

[![Build Status](https://travis-ci.org/adobe/react-twist-webpack-plugin.svg?branch=master)](https://travis-ci.org/adobe/react-twist-webpack-plugin) [![Greenkeeper badge](https://badges.greenkeeper.io/adobe/react-twist-webpack-plugin.svg)](https://greenkeeper.io/)

This library contains a Webpack plugin for building an application with [React-Twist](https://github.com/adobe/react-twist).

## Getting Started

If you want to use both the state-management and component layers of Twist, you'll need to install the following (via NPM or Yarn):

* `@twist/core` - This includes support for stores, data binding, and application state management.
* `@twist/react` - The React implementation of Twist components.
* `@twist/react-webpack-plugin` - A [webpack](https://webpack.js.org/) plugin that compiles Twist files (Twist has its own Babel transform that runs before React's).

If you're not using webpack, you can also get hold of the Babel configuration directly, using [`@twist/configuration`](https://github.com/adobe/twist-configuration) (this is done automatically by the webpack plugin).

After that, the only thing you need is a `.twistrc` file in the root of your project, that tells Twist which libraries to include (this is also used by the [Twist ESlint plugin](https://github.com/adobe/eslint-plugin-twist)). There are a number of advanced options, but to get up and running, you just need to tell Twist that you're using React-Twist:

```json
{
    "libraries": [
        "@twist/react"
    ]
}
```

In your `webpack.conf.js` you can now include the React Twist plugin - by default this will compile all files that end in `.jsx` with Twist and React:

```js
const ReactTwistPlugin = require('@twist/react-webpack-plugin');

module.exports = {
    ...
    plugins: [
        new ReactTwistPlugin(),
        ...
    ],
    ...
};
```
